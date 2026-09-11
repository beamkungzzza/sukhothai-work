export const dynamic='force-dynamic';
export async function GET(_request:Request,context:{params:Promise<{key:string}>}){
 const {key}=await context.params;
 if(!/^[a-f0-9]{64}-[a-f0-9-]{36}\.pdf$/.test(key))return new Response('Not found',{status:404});
 // Historical files remain in the original host. New uploads are stored in Drive.
 return Response.redirect('https://sukhothai-work.beam-rx.chatgpt.site/api/files/'+key,307);
}
