'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, CalendarDays, Users, ArrowUpRight, ClipboardList, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import initialRows from './tasks.json';
import TaskForm from './task-form';
import type { Task } from './task-model';
import { Button } from '@/components/ui/button';
import PdfAttachment from './pdf-attachment';
import {attachmentUrls} from './pdf-model';
import {ownersOf,matchesOwner} from './owners';
import TaskCalendar from './task-calendar';
import {isSnapshot} from './sync-model';
const source = 'https://docs.google.com/spreadsheets/d/1-g0Px1bxaeeNbbom9ZsNL0mCWlgfr3qBXHxcswMq6QU/edit#gid=603367032';
const value = (v: string | null | undefined) => v && v !== '-' ? v : 'ไม่ระบุ';
function date(v: string | null | undefined) {
 if (!v || v === '-') return 'ยังไม่กำหนด';
 const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
 if (!m) return v;
 const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
 return `${Number(m[1])} ${months[Number(m[2])-1]} ${m[3].length===2?'25'+m[3]:m[3]}`;
}
export default function Home() {
 const [query,setQuery] = useState('');
 const [owner,setOwner]=useState('all');
 const [view,setView]=useState<'list'|'calendar'>('list');const [expanded,setExpanded]=useState<string[]>([]);const [focused,setFocused]=useState('');
 useEffect(()=>{if(focused&&view==='list')document.getElementById('task-'+focused)?.scrollIntoView({behavior:'smooth',block:'start'});},[focused,view]);
 const [tasks,setTasks]=useState<Task[]>(initialRows.map(r=>({values:Array.from({length:11},(_,i)=>String(r[i]||'')),version:''})));
 const rows=tasks.map(t=>t.values);
 const [connected,setConnected]=useState(false);const [canEdit,setCanEdit]=useState(false);const [email,setEmail]=useState<string|null>(null);
 const [sync,setSync]=useState('กำลังเชื่อมต่อ Google Sheets…');const [editing,setEditing]=useState<Task|null|undefined>(undefined);
 const syncRevision=useRef(0);const lastRevision=useRef(0);
 useEffect(()=>{
  let cancelled=false,fetching=false;let controller:AbortController;let watching=false;let watchController:AbortController;let watchTimer:ReturnType<typeof setTimeout>;
  function apply(data:any){if(!isSnapshot(data)||data.revision<=lastRevision.current)return;lastRevision.current=data.revision;setTasks(data.tasks);const fresh=Date.now()-Date.parse(data.checkedAt)<120000;setConnected(fresh);setSync(fresh?'รับข้อมูลล่าสุดแล้ว · '+new Date(data.checkedAt).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'ข้อมูลอาจยังไม่ล่าสุด · กำลังเชื่อมต่ออีกครั้ง');}
  async function refresh(){if(cancelled||document.hidden||fetching)return;fetching=true;const savedAtStart=syncRevision.current;controller=new AbortController();try{const res=await fetch('/api/tasks',{cache:'no-store',signal:controller.signal});const data=await res.json();if(cancelled)return;setCanEdit(!!data.canEdit);setEmail(data.email||null);if(res.ok&&isSnapshot(data)){if(savedAtStart===syncRevision.current)apply(data);if(data.connected)setConnected(true);if(!data.connected){setConnected(false);setSync(data.error||'ข้อมูลอาจยังไม่ล่าสุด');}}else{setConnected(false);setSync(data.error||'เชื่อมต่อข้อมูลไม่สำเร็จ');}}catch{if(!cancelled){setConnected(false);setSync('การเชื่อมต่อขาดหาย · แสดงข้อมูลล่าสุดที่ได้รับ');}}finally{fetching=false;}}
  async function connect(){if(cancelled||document.hidden||watching)return;watching=true;let retry=100;watchController=new AbortController();try{const res=await fetch('/api/sync/changes?after='+lastRevision.current,{cache:'no-store',signal:watchController.signal});if(!res.ok)throw Error('Live unavailable');const data=await res.json();if(!cancelled&&!document.hidden&&isSnapshot(data))apply(data);}catch{retry=5000;}finally{watching=false;if(!cancelled&&!document.hidden)watchTimer=setTimeout(()=>{void connect()},retry);}}
  function resume(){if(document.hidden){clearTimeout(watchTimer);watchController?.abort();controller?.abort();}else{connect();void refresh();}}
  connect();void refresh();const timer=setInterval(()=>{void refresh();},65000);
  document.addEventListener('visibilitychange',resume);window.addEventListener('online',resume);window.addEventListener('focus',resume);
  return()=>{cancelled=true;clearInterval(timer);clearTimeout(watchTimer);watchController?.abort();controller?.abort();document.removeEventListener('visibilitychange',resume);window.removeEventListener('online',resume);window.removeEventListener('focus',resume);};
 },[]);
 function saved(next:Task[],revision?:number){syncRevision.current++;if(revision&&revision<lastRevision.current)return;if(revision)lastRevision.current=Math.max(lastRevision.current,revision);setTasks(next);setConnected(true);setSync('บันทึกลง Google Sheets แล้ว');}
 const people=[...new Set(rows.flatMap(r=>ownersOf(r[3])))].sort((a,b)=>a.localeCompare(b,'th'));
 const ownerRows=rows.filter(r=>matchesOwner(r[3],owner));
 const ownerLabel=owner==='all'?'งานทั้งหมด':owner==='unassigned'?'ยังไม่ระบุผู้รับผิดชอบ':'งานของ '+owner.slice(7);
 const shown = ownerRows.filter(r=>r.join(' ').toLocaleLowerCase('th').includes(query.trim().toLocaleLowerCase('th')));
 return <main>
 <header className="top"><a href="#main" className="brand"><span className="monogram">S</span><span>SUK <small>TEAM SPACE</small></span></a><a className="source" href={source} target="_blank" rel="noreferrer">เปิดชีต <ArrowUpRight size={17}/></a></header>
 <div className="workspace" id="main"><section className="intro"><div className="eyebrow"><span/> คณะสี SUK · 2569</div><h1>ตารางงานของเรา<span>.</span></h1><p>งาน ไอเดีย และเรื่องที่ต้องช่วยกันติดตาม</p></section>
 <section className="owner-filter" aria-label="เลือกผู้รับผิดชอบหลัก"><h2>ดูงานตามผู้รับผิดชอบหลัก</h2><p>เลือกชื่อเพื่อดูงานของแต่ละคน · งานที่รับผิดชอบร่วมกันจะแสดงในรายชื่อของทุกคน</p><div className="owner-options">{[{id:'all',label:'ทั้งหมด'},...people.map(name=>({id:'person:'+name,label:name})),{id:'unassigned',label:'ยังไม่ระบุ'}].map(option=><button type="button" key={option.id} aria-pressed={owner===option.id} onClick={()=>setOwner(option.id)}>{option.label}<span>{rows.filter(r=>matchesOwner(r[3],option.id)).length}</span></button>)}</div></section><section className="stats" aria-label={'ภาพรวม · '+ownerLabel}><div><ClipboardList/><strong>{ownerRows.length}</strong><span>รายการในกลุ่มนี้</span></div><div><AlertCircle/><strong>{ownerRows.filter(r=>r[4]==='ติดขัด').length}</strong><span>สถานะติดขัด</span></div><div><span className="urgent-dot"/><strong>{ownerRows.filter(r=>r[5]==='ด่วน'||r[5]==='สูง').length}</strong><span>ด่วน / สำคัญสูง</span></div></section>
 <section className="board"><div className="sync-bar"><p role="status">{sync}</p><div>{canEdit?<Button className="save-button" disabled={!connected} onClick={()=>setEditing(null)}>+ เพิ่มงาน</Button>:<a className="manage-link" href="/manage" target="_top">เข้าสู่ระบบเพื่อจัดการงาน</a>}</div></div>{email&&<p className="account-note">{email}{canEdit?' · แก้ไขงานได้':' · ดูข้อมูลเท่านั้น'}</p>}<div className="board-heading"><h2>{ownerLabel} <span>{shown.length}</span></h2><span className="hint">เรียงตามลำดับในชีต</span></div><label className="search"><Search size={21}/><Input type="search" aria-label="ค้นหางาน ผู้รับผิดชอบ หรือรายละเอียด" placeholder="ค้นหางาน ผู้รับผิดชอบ หรือรายละเอียด" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="view-toggle" aria-label="รูปแบบการดูงาน"><button type="button" aria-pressed={view==='list'} onClick={()=>setView('list')}>รายการงาน</button><button type="button" aria-pressed={view==='calendar'} onClick={()=>setView('calendar')}>ปฏิทินงาน</button></div>{view==='calendar'?<TaskCalendar tasks={tasks.filter(t=>shown.some(r=>r[0]===t.values[0]))} onOpen={id=>{setExpanded([id]);setFocused(id);setView('list')}}/>:<Accordion multiple value={expanded} onValueChange={setExpanded} className="task-list">{shown.map(r=><AccordionItem id={'task-'+r[0]} key={r[0]} value={String(r[0])} className="task"><AccordionTrigger className="task-trigger"><span className="task-summary"><span className="labels"><span className="task-number">งาน #{r[0]}</span><span className="category">{r[2]}</span><span className={'status '+(r[4]==='ติดขัด'?'blocked':'')}>{r[4]||'ไม่ระบุสถานะ'}</span>{r[5]&&<span className={'priority '+(r[5]==='ด่วน'?'urgent':r[5]==='สูง'?'high':'')}>{r[5]}</span>}</span><span className="task-title">{r[1]}</span><span className="meta"><span><Users size={16}/><span><span className="meta-label">ผู้รับผิดชอบ</span>{r[3]||'ยังไม่ระบุ'}</span></span><span><CalendarDays size={16}/><span><span className="meta-label">กำหนดส่ง</span>{date(r[6])}</span></span></span></span></AccordionTrigger><AccordionContent className="details"><dl><div><dt>ช่วงเวลางาน</dt><dd>เริ่ม: {date(tasks.find(t=>t.values[0]===r[0])?.startDate)} · กำหนดส่ง: {date(r[6])}</dd></div><div className="next-step"><dt>ขั้นตอนต่อไป</dt><dd>{value(r[7])}</dd></div><div className={r[8]&&r[8]!=='-'?'obstacle':''}><dt>ติดขัด / รอใคร</dt><dd>{value(r[8])}</dd></div><div><dt>รายละเอียด / ลิงก์</dt><dd>{value(r[9])}{attachmentUrls(r[9],tasks.find(t=>t.values[0]===r[0])?.pdfUrl||undefined).map(url=><PdfAttachment key={url} fileUrl={url}/>)}</dd></div></dl><div className="task-edit">{canEdit&&<Button variant="outline" disabled={!connected} onClick={()=>setEditing(tasks.find(t=>t.values[0]===r[0]))}>แก้ไขงานนี้</Button>}</div><p className="record">รายการ #{r[0]} · อัปเดตในชีต {date(r[10])}</p></AccordionContent></AccordionItem>)}</Accordion>}
 {view==='list'&&shown.length===0&&<div className="no-results"><Search/><h3>ไม่พบงานตามตัวเลือกนี้</h3><p>ลองเลือกผู้รับผิดชอบคนอื่น หรือล้างคำค้นหา</p><button onClick={()=>{setQuery('');setOwner('all')}}>กลับไปดูงานทั้งหมด</button></div>}
 </section>{editing!==undefined&&<TaskForm task={editing} onClose={()=>setEditing(undefined)} onSaved={saved}/>}<footer><span className="footer-brand">SUK / TOGETHER, WE DO.</span><p>ข้อมูลจากแท็บ “ตารางงาน” ใน Google Sheets</p><p>{connected?'รับการอัปเดตสดจากชีต · ตรวจสำรองทุกประมาณ 1 นาที':'ยังไม่ได้รับข้อมูลสด · แสดงข้อมูลล่าสุดที่มี'}</p><p>วันที่ปี 69 แสดงเป็น พ.ศ. 2569 ตามบริบทตารางงาน</p></footer></div></main>;
}
