const env=process.env;
export async function sheetsBridge(payload:object,timeout=25000){
 const e=env as unknown as Record<string,string>;if(!e.SHEETS_BRIDGE_URL||!e.SHEETS_BRIDGE_KEY)throw Error('NOT_CONFIGURED');
 const url=new URL(e.SHEETS_BRIDGE_URL);if(url.origin!=='https://script.google.com'||!url.pathname.endsWith('/exec'))throw Error('INVALID_CONFIG');
 const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,key:e.SHEETS_BRIDGE_KEY}),redirect:'follow',signal:AbortSignal.timeout(timeout)});
 if(!res.ok)throw Error('UPSTREAM');const data=await res.json() as {ok:boolean;error?:string;tasks?:unknown[];url?:string;name?:string};if(!data.ok)throw Error(data.error||'UPSTREAM');return data;
}
