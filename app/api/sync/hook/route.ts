const env=process.env;
import {storeSnapshot} from '../../../live-snapshot';
import {isSnapshot} from '../../../sync-model';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const key=(env as unknown as Record<string,string>).SHEETS_BRIDGE_KEY;
 if(!key||request.headers.get('Authorization')!=='Bearer '+key)return new Response('Unauthorized',{status:401});
 try{
  const text=await request.text();if(text.length>2000000)return new Response('Too large',{status:413});
  const data=JSON.parse(text);if(!isSnapshot(data))return new Response('Invalid snapshot',{status:400});
  const saved=await storeSnapshot(data);return Response.json({ok:true,revision:saved.revision},{headers:{'Cache-Control':'no-store'}});
 }catch{return new Response('Sync unavailable',{status:503});}
}
