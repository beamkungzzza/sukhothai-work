import {cachedSnapshot} from '../../../live-snapshot';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const after=Number(new URL(request.url).searchParams.get('after')||0);if(!Number.isSafeInteger(after)||after<0)return new Response('Invalid revision',{status:400});
 const began=Date.now();
 try{while(!request.signal.aborted&&Date.now()-began<20000){const data=await cachedSnapshot();if(data&&data.revision>after)return Response.json(data,{headers:{'Cache-Control':'no-store, no-transform'}});await new Promise(r=>setTimeout(r,1000));}
 return Response.json({changed:false},{headers:{'Cache-Control':'no-store'}});
 }catch{return new Response('Live updates unavailable',{status:503});}
}
