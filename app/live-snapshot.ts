import {redis,cacheKey} from './redis';
import {sheetsBridge} from './sheets-bridge';
import {isSnapshot,type Snapshot} from './sync-model';
const KEY=cacheKey('snapshot'),LEASE=cacheKey('refresh-lease');
export async function cachedSnapshot(){const s=await redis<string|null>('GET',KEY);if(!s)return null;const data=JSON.parse(s);if(!isSnapshot(data))throw Error('INVALID_SNAPSHOT');return data;}
export async function storeSnapshot(next:Snapshot){
 if(!isSnapshot(next))throw Error('INVALID_SNAPSHOT');
 const s=await redis<string>('EVAL',"local old=redis.call('GET',KEYS[1]); if old and tonumber(cjson.decode(old).revision)>=tonumber(ARGV[2]) then return old end; redis.call('SET',KEYS[1],ARGV[1]); return ARGV[1]",1,KEY,JSON.stringify(next),next.revision);
 return JSON.parse(s) as Snapshot;
}
export async function latestSnapshot(){
 const current=await cachedSnapshot();if(current&&Date.now()-Date.parse(current.checkedAt)<60000)return current;
 const lease=await redis<string|null>('SET',LEASE,'1','NX','EX',30);
 if(!lease){if(current)return current;throw Error('SYNC_PENDING');}
 try{const fresh=await sheetsBridge({action:'read'});if(!isSnapshot(fresh))throw Error('INVALID_SNAPSHOT');return await storeSnapshot(fresh);}catch(error){if(current)return current;throw error;}
}
