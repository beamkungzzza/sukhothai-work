'use client';
import { useState,useId } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function PdfAttachment({fileUrl}:{fileUrl:string}) {
 const id=useId();const url=new URL(fileUrl);const driveId=url.hostname==='drive.google.com'?url.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1]:null;
 const preview=driveId?`https://drive.google.com/file/d/${driveId}/preview`:fileUrl;
 const [open, setOpen] = useState(false);
 return <section className="pdf-attachment" aria-label="ไฟล์แนบ">
  <div className="pdf-actions"><Button className="pdf-button" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls={id}><FileText/>{open?'ปิดตัวอย่างไฟล์':'ดูตัวอย่างไฟล์'}</Button><a className="pdf-external" href={fileUrl} target="_blank" rel="noopener noreferrer">เปิดไฟล์ <ExternalLink size={16}/></a></div>
  {open&&<div id={id} className="pdf-preview"><p>หากไฟล์ชนิดนี้ไม่มีตัวอย่างหรือไม่แสดงบนมือถือ ให้เลือก “เปิดไฟล์”{driveId?' และลงชื่อเข้าใช้บัญชีที่มีสิทธิ์ดูไฟล์':''}</p><iframe title="ไฟล์แนบ" src={preview} allowFullScreen /></div>}
 </section>;
}
