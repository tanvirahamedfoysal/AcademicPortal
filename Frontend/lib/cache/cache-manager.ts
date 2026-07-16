export async function syncCache(
 key:string,
 updatedAt:string,
 fetcher:()=>Promise<any>
){
 const old = localStorage.getItem(key);
 const meta = localStorage.getItem(key+'_updated');

 if(old && meta===updatedAt){
  return JSON.parse(old);
 }

 const fresh = await fetcher();
 localStorage.setItem(key,JSON.stringify(fresh));
 localStorage.setItem(key+'_updated',updatedAt);

 return fresh;
}
