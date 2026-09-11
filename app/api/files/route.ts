import {Buffer} from 'node:buffer';
import {createHash} from 'node:crypto';
import {taskIdentity} from '../../task-access';
import {sheetsBridge} from '../../sheets-bridge';
import {redis,cacheKey} from '../../redis';
export const dynamic='force-dynamic';
export const maxDuration=60;
const CHUNK=2*1024*1024,MAX=10*1024*1024;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const who=await taskIdentity();
 if(!who.canEdit)return json({error:'บัญชีนี้ไม่มีสิทธิ์แนบไฟล์'},403);
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'คำขอไม่ถูกต้อง'},403);
 const id=request.headers.get('X-Upload-Id');if(!id||!/^[a-f0-9-]{36}$/.test(id))return json({error:'กรุณาเลือกไฟล์ใหม่'},400);
 try{
  const name=decodeURIComponent(request.headers.get('X-File-Name')||''),share=request.headers.get('X-File-Share')||'private';
  const mime=request.headers.get('Content-Type')||'application/octet-stream';
  const part=Number(request.headers.get('X-Upload-Part')),total=Number(request.headers.get('X-Upload-Total')),size=Number(request.headers.get('X-Upload-Size'));
  if(!name.trim()||name.length>200||mime.length>200||!['private','link'].includes(share)||!Number.isInteger(size)||size<=0||size>MAX||!Number.isInteger(part)||part<0||!Number.isInteger(total)||total!==Math.ceil(size/CHUNK)||part>=total)return json({error:'ข้อมูลไฟล์ไม่ถูกต้อง'},400);
  const key=cacheKey('upload:'+createHash('sha256').update(who.email!).digest('hex')+':'+id);
  const complete=await redis<string|null>('GET',key+':result');if(complete)return json(JSON.parse(complete));
  const reader=request.body?.getReader();if(!reader)return json({error:'ไฟล์ว่าง'},400);
  const pieces:Uint8Array[]=[];let bytes=0;
  while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.length;if(bytes>CHUNK){await reader.cancel();return json({error:'ส่วนไฟล์ใหญ่เกินไป'},413)}pieces.push(r.value);}
  const expected=part===total-1?size-part*CHUNK:CHUNK;if(bytes!==expected)return json({error:'ได้รับไฟล์ไม่ครบ กรุณาลองใหม่'},400);
  const meta=JSON.stringify({name,share,mime,total,size});
  await redis('SET',key+':meta',meta,'NX','EX',600);
  if(await redis('GET',key+':meta')!==meta)return json({error:'ไฟล์เปลี่ยนแปลง กรุณาเลือกไฟล์ใหม่'},409);
  await redis('SET',key+':'+part,Buffer.concat(pieces).toString('base64'),'EX',600);
  if(part<total-1)return json({ok:true,part});
  const parts=await redis<(string|null)[]>('MGET',...Array.from({length:total},(_,i)=>key+':'+i));
  if(parts.some(p=>p===null))return json({error:'ส่วนไฟล์หมดอายุ กรุณาลองอัปโหลดใหม่'},409);
  const file=Buffer.concat(parts.map(p=>Buffer.from(p!,'base64')));if(file.length!==size)return json({error:'ขนาดไฟล์ไม่ถูกต้อง'},400);
  const result=await sheetsBridge({action:'upload',requestId:id,file:{name,share,mime,data:file.toString('base64')}},50000);
  try{await redis('SET',key+':result',JSON.stringify(result),'EX',600);await redis('DEL',key+':meta',...Array.from({length:total},(_,i)=>key+':'+i));}catch{/* Temporary pieces expire automatically. */}
  return json(result);
 }catch{return json({error:'บันทึกไฟล์ลง Google Drive ไม่สำเร็จ กรุณาลองอีกครั้ง ข้อมูลในฟอร์มยังอยู่'},503);}
}
