'use client';
import {useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {NativeSelect} from '@/components/ui/native-select';
import {Button} from '@/components/ui/button';
import {options,validateValues,emptyTaskValues,type Task} from './task-model';
import {parseTaskDate,sheetDate} from './date-model';
const names=['ลำดับ','งาน / ไอเดีย','ประเภท','ผู้รับผิดชอบหลัก','สถานะ','ความสำคัญ','กำหนดส่ง','ขั้นตอนต่อไป','ติดขัด / รอใคร','รายละเอียด / ลิงก์'];
export default function TaskForm({task,onClose,onSaved}:{task:Task|null;onClose:()=>void;onSaved:(tasks:Task[],revision?:number)=>void}){
 const [values,setValues]=useState<string[]>(task?[...task.values]:emptyTaskValues());
 const [startDate,setStartDate]=useState(()=>parseTaskDate(task?.startDate)||'');
 const [share,setShare]=useState('private');
 const [file,setFile]=useState<File|null>(null);const [uploadId,setUploadId]=useState(()=>crypto.randomUUID());
 const [uploaded,setUploaded]=useState('');const [phase,setPhase]=useState('');
 const [requestId]=useState(()=>crypto.randomUUID());const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function save(e:React.FormEvent){
  e.preventDefault();if(busy)return;setError('');
  try{validateValues(values);if(file&&file.size>10*1024*1024)throw Error('ไฟล์ต้องไม่เกิน 10 MB');if(file&&file.name.length>200)throw Error('ชื่อไฟล์ต้องไม่เกิน 200 ตัวอักษร');const end=parseTaskDate(values[6]);if(startDate&&end&&startDate>end)throw Error('กำหนดส่งต้องไม่อยู่ก่อนวันเริ่มงาน');if(file&&values[9].length>4400)throw Error('กรุณาลดรายละเอียดให้ไม่เกิน 4,400 ตัวอักษรเพื่อแนบไฟล์');}catch(e){setError((e as Error).message);return;}
  setBusy(true);try{
   let url=uploaded;
   if(file&&!url){const chunk=2*1024*1024,total=Math.ceil(file.size/chunk);for(let part=0;part<total;part++){setPhase('กำลังเก็บไฟล์ใน Google Drive… '+(part+1)+'/'+total);const upload=await fetch('/api/files',{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream','X-Upload-Id':uploadId,'X-File-Name':encodeURIComponent(file.name),'X-File-Share':share,'X-Upload-Part':String(part),'X-Upload-Total':String(total),'X-Upload-Size':String(file.size)},body:file.slice(part*chunk,(part+1)*chunk),signal:AbortSignal.timeout(60000)});const result=await upload.json();if(!upload.ok)throw Error(result.error||'อัปโหลดไม่สำเร็จ');if(result.url){url=result.url;break;}}if(!url)throw Error('อัปโหลดไฟล์ไม่ครบ');setUploaded(url);}
   const next=[...values];if(url&&!next[9].includes(url))next[9]=[next[9],`ไฟล์แนบ: ${file?.name.slice(0,120)||'เอกสารแนบ'}`,url].filter(Boolean).join('\n');
   validateValues(next);setPhase('กำลังบันทึกลงชีต…');
   const res=await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:task?'update':'create',values:next,startDate:sheetDate(startDate),version:task?.version,requestId}),signal:AbortSignal.timeout(35000)});
   const data=await res.json();if(!res.ok||!data.ok)throw Error(data.error||'บันทึกไม่สำเร็จ');onSaved(data.tasks,data.revision);onClose();
  }catch(e){setError((e as Error).name==='TimeoutError'?'การตอบกลับใช้เวลานาน คุณลองบันทึกซ้ำในฟอร์มนี้ได้ ระบบจะตรวจป้องกันรายการซ้ำ':(e as Error).message)}finally{setBusy(false)}
 }
 return <Dialog open onOpenChange={open=>{if(!open&&!busy)onClose()}}><DialogContent className="task-form-dialog" showCloseButton={false}><DialogTitle>{task?'แก้ไขงาน #'+task.values[0]:'เพิ่มงานใหม่'}</DialogTitle><DialogDescription>บันทึกลงตารางงาน SUK ใน Google Sheets</DialogDescription><form onSubmit={save}><div className="form-fields"><label><span>วันเริ่มงาน</span><Input type="date" value={startDate} disabled={busy} onChange={e=>setStartDate(e.target.value)}/><small>เว้นว่างได้ หากยังไม่ทราบวันเริ่ม</small></label>{names.slice(1).map((label,n)=>{const i=n+1;return <label key={i} className={i===1||i>=7?'form-wide':''}><span>{label}{i===1?' *':''}</span>{options[i]?<NativeSelect value={values[i]} disabled={busy} onChange={e=>setValues(v=>v.map((x,j)=>j===i?e.target.value:x))}>{options[i].map(o=><option key={o} value={o}>{o||'ไม่ระบุ'}</option>)}</NativeSelect>:i===6?<Input type="date" value={parseTaskDate(values[6])||''} disabled={busy} min={startDate||undefined} onChange={e=>setValues(v=>v.map((x,j)=>j===6?sheetDate(e.target.value):x))}/>:i>=7?<Textarea value={values[i]} disabled={busy} maxLength={5000} rows={3} onChange={e=>setValues(v=>v.map((x,j)=>j===i?e.target.value:x))}/>:<Input required={i===1} value={values[i]} disabled={busy} maxLength={i===1?300:5000} placeholder={i===6?'เช่น 30/09/2569 หรือ ยังไม่กำหนด':undefined} onChange={e=>setValues(v=>v.map((x,j)=>j===i?e.target.value:x))}/>}</label>})}<label className="form-wide"><span>แนบไฟล์</span><Input type="file" disabled={busy} onChange={e=>{setFile(e.target.files?.[0]||null);setUploaded('');setUploadId(crypto.randomUUID());}}/><small>PDF, Word, Excel, รูปภาพ และไฟล์อื่น ๆ ไม่เกิน 10 MB · เก็บใน Google Drive และเพิ่มลิงก์ลงชีต</small>{file&&<small>เลือกแล้ว: {file.name}</small>}</label><label className="form-wide"><span>สิทธิ์เปิดดูไฟล์ใหม่</span><NativeSelect value={share} disabled={busy||!!uploaded} onChange={e=>setShare(e.target.value)}><option value="private">ส่วนตัว — แชร์ให้ทีมภายหลังใน Google Drive</option><option value="link">ทุกคนที่มีลิงก์เปิดดูได้</option></NativeSelect><small>ไฟล์เก็บในบัญชี Google Drive เจ้าของเว็บไซต์</small></label></div>{error&&<p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>ยกเลิก</Button><Button className="save-button" type="submit" disabled={busy}>{busy?phase:'บันทึกลงชีต'}</Button></div></form></DialogContent></Dialog>;
}
