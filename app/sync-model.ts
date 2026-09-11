import type {Task} from './task-model';
export type Snapshot={ok:true;tasks:Task[];revision:number;checkedAt:string};
export function isSnapshot(value:unknown):value is Snapshot{
 const s=value as Snapshot;return !!s&&s.ok===true&&Number.isSafeInteger(s.revision)&&s.revision>0&&typeof s.checkedAt==='string'&&Number.isFinite(Date.parse(s.checkedAt))&&Array.isArray(s.tasks)&&s.tasks.length<=2000&&s.tasks.every(t=>t&&Array.isArray(t.values)&&t.values.length===11&&t.values.every(v=>typeof v==='string')&&typeof t.version==='string');
}
