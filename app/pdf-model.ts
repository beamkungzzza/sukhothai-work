export const MAX_PDF_BYTES=10*1024*1024;
export function pdfSignature(bytes:Uint8Array){return bytes.length>=5&&String.fromCharCode(...bytes.slice(0,5))==='%PDF-';}
export function attachmentUrls(text:string,extra?:string){
 return [...new Set([...(text.match(/https?:\/\/[^\s<>"']+/g)||[]),extra||''])].filter(url=>{
  try {const u=new URL(url);return u.protocol==='https:'&&(u.pathname.endsWith('.pdf')||u.hostname==='drive.google.com'&&/^\/file\/d\/[\w-]+\//.test(u.pathname));}catch{return false;}
 });
}
