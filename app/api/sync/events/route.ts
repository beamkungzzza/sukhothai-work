import {cachedSnapshot} from '../../../live-snapshot';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 let stop=false;let timer:ReturnType<typeof setTimeout>;let wake:(()=>void)|undefined;
 const cancel=()=>{stop=true;clearTimeout(timer);wake?.();};request.signal.addEventListener('abort',cancel,{once:true});
 const body=new ReadableStream<Uint8Array>({async start(controller){
  const encoder=new TextEncoder();let revision=Number(request.headers.get('Last-Event-ID')||0);const began=Date.now();
  const send=(text:string)=>{if(!stop)controller.enqueue(encoder.encode(text));};
  try{
   send('retry: 1000\n\n');
   while(!stop&&Date.now()-began<25000){
    const snapshot=await cachedSnapshot();
    if(snapshot&&snapshot.revision>revision){revision=snapshot.revision;send(`id: ${revision}\nevent: tasks\ndata: ${JSON.stringify(snapshot)}\n\n`);}
    else send(': heartbeat\n\n');
    await new Promise<void>(resolve=>{wake=resolve;timer=setTimeout(resolve,1000);});
   }
  }catch{send('event: unavailable\ndata: {}\n\n');}
  finally{request.signal.removeEventListener('abort',cancel);if(!stop)controller.close();}
 },cancel});
 return new Response(body,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','X-Accel-Buffering':'no'}});
}
