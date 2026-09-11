'use client';
import {useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import type {Task} from './task-model';
import {bangkokToday,dateLabel,taskRange} from './date-model';
import {Button} from '@/components/ui/button';
export default function TaskCalendar({tasks,onOpen}:{tasks:Task[];onOpen:(id:string)=>void}){
 const today=bangkokToday();const [month,setMonth]=useState(()=>today.slice(0,7));const [selected,setSelected]=useState(today);
 const [year,mo]=month.split('-').map(Number);const first=new Date(Date.UTC(year,mo-1,1));const offset=(first.getUTCDay()+6)%7;const days=new Date(Date.UTC(year,mo,0)).getUTCDate();
 const entries=tasks.map(task=>({task,range:taskRange(task.startDate,task.values[6])}));
 const onDay=(day:string)=>entries.filter(e=>e.range&&e.range.start<=day&&e.range.end>=day);
 const chosen=onDay(selected);const undated=entries.filter(e=>!e.range);const inMonth=entries.filter(e=>e.range&&e.range.start<=month+'-'+String(days).padStart(2,'0')&&e.range.end>=month+'-01');
 function move(delta:number){const d=new Date(Date.UTC(year,mo-1+delta,1));const next=d.toISOString().slice(0,7);setMonth(next);setSelected(next+'-01');}
 const label=new Intl.DateTimeFormat('th-TH',{month:'long',year:'numeric',timeZone:'UTC'}).format(first);
 return <section className="calendar-panel" aria-label="ปฏิทินระยะเวลางาน"><div className="calendar-toolbar"><h2>{label}</h2><div><Button variant="outline" aria-label="เดือนก่อนหน้า" onClick={()=>move(-1)}><ChevronLeft/></Button><Button variant="outline" onClick={()=>{setMonth(today.slice(0,7));setSelected(today)}}>วันนี้</Button><Button variant="outline" aria-label="เดือนถัดไป" onClick={()=>move(1)}><ChevronRight/></Button></div></div><p className="calendar-help">เลือกวันเพื่อดูงาน · แสดงช่วงวันเริ่มถึงกำหนดส่ง หากไม่มีวันเริ่มจะแสดงเฉพาะวันส่ง</p>
 <div className="calendar-grid">{['จ.','อ.','พ.','พฤ.','ศ.','ส.','อา.'].map(d=><span className="weekday" key={d}>{d}</span>)}{Array.from({length:offset},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:days},(_,i)=>{const day=month+'-'+String(i+1).padStart(2,'0');const list=onDay(day);const due=list.some(e=>e.range!.hasEnd&&e.range!.end===day);return <button type="button" key={day} className={'calendar-day'+(day===today?' today':'')+(due?' has-due':'')} aria-pressed={selected===day} aria-label={dateLabel(day)+', '+list.length+' งาน'} onClick={()=>setSelected(day)}><strong>{i+1}</strong>{list.length>0&&<span>{list.length} งาน</span>}{due&&<small>วันส่ง</small>}</button>})}</div>
 <div className="calendar-agenda"><h3>{dateLabel(selected)} · {chosen.length} งาน</h3>{chosen.length===0?<p>ไม่มีงานที่ระบุช่วงเวลาครอบคลุมวันนี้</p>:chosen.map(({task,range})=><button type="button" className="agenda-task" key={task.values[0]} onClick={()=>onOpen(task.values[0])}><strong>{task.values[1]}</strong><span>{task.values[3]||'ยังไม่ระบุผู้รับผิดชอบ'} · {task.values[4]||'ไม่ระบุสถานะ'}</span><small>{range!.hasStart?'เริ่ม '+dateLabel(range!.start):'ยังไม่ระบุวันเริ่ม'} · {range!.hasEnd?'ส่ง '+dateLabel(range!.end):'ยังไม่ระบุกำหนดส่ง'}</small></button>)}</div>
 <div className="calendar-periods"><h3>ช่วงเวลางานในเดือนนี้ · {inMonth.length} งาน</h3>{inMonth.sort((a,b)=>a.range!.start.localeCompare(b.range!.start)).map(({task,range})=><button type="button" className="agenda-task" key={task.values[0]} onClick={()=>onOpen(task.values[0])}><strong>{task.values[1]}</strong><span>{task.values[3]||'ยังไม่ระบุผู้รับผิดชอบ'}</span><small>{range!.hasStart?dateLabel(range!.start):'ไม่ระบุวันเริ่ม'} → {range!.hasEnd?dateLabel(range!.end):'ไม่ระบุวันส่ง'}</small></button>)}{inMonth.length===0&&<p>ไม่มีงานที่ระบุช่วงเวลาในเดือนนี้</p>}</div>
 {undated.length>0&&<div className="calendar-undated"><h3>ยังจัดลงปฏิทินไม่ได้ · {undated.length} งาน</h3><p>ยังไม่มีวันที่แน่นอน หรือวันที่สิ้นสุดอยู่ก่อนวันเริ่ม</p>{undated.map(({task})=><button type="button" className="agenda-task" key={task.values[0]} onClick={()=>onOpen(task.values[0])}><strong>{task.values[1]}</strong><span>{task.values[3]||'ยังไม่ระบุผู้รับผิดชอบ'} · กำหนดส่ง: {task.values[6]||'ยังไม่ระบุ'}</span></button>)}</div>}
 </section>;
}
