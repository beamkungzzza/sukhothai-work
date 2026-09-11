import 'server-only';
export async function redis<T=unknown>(...command:(string|number)[]):Promise<T>{
 const url=process.env.UPSTASH_REDIS_REST_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if(!url||!token||new URL(url).protocol!=='https:')throw Error('REDIS_NOT_CONFIGURED');
 const response=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(command),cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('REDIS_UNAVAILABLE');const data=await response.json();if(data.error)throw Error('REDIS_COMMAND_FAILED');return data.result as T;
}
export function cacheKey(s:string){return (process.env.CACHE_NAMESPACE||'sukhothai-production')+':'+s;}
