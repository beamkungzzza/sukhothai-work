// Sheet dates use Buddhist years (including two-digit 69 = 2569).
export function parseTaskDate(value?:string):string|null{
 const text=(value||'').trim();let y:number,m:number,d:number;
 const iso=text.match(/^(\d{4})-(\d{2})-(\d{2})$/),thai=text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
 if(iso){y=Number(iso[1]);m=Number(iso[2]);d=Number(iso[3]);if(y>2400)y-=543;}
 else if(thai){d=Number(thai[1]);m=Number(thai[2]);y=Number(thai[3]);if(thai[3].length===2)y+=2500;if(y>2400)y-=543;}else return null;
 const dt=new Date(Date.UTC(y,m-1,d));if(y<1900||y>2200||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)return null;
 return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
export function sheetDate(iso:string){if(!iso)return '';const d=parseTaskDate(iso);if(!d)return iso;const [y,m,day]=d.split('-');return `${day}/${m}/${Number(y)+543}`;}
export function bangkokToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function taskRange(start?:string,end?:string){const a=parseTaskDate(start),b=parseTaskDate(end);if(a&&b&&a>b)return null;if(!a&&!b)return null;return {start:a||b!,end:b||a!,hasStart:!!a,hasEnd:!!b};}
export function dateLabel(iso:string){const [y,m,d]=iso.split('-').map(Number);return new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d)));}
