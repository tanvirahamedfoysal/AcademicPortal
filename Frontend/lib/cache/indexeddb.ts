export async function saveCache(key:string,data:any){
if(typeof window==='undefined') return;
localStorage.setItem(key,JSON.stringify(data));
}

export async function readCache(key:string){
if(typeof window==='undefined') return null;
const item=localStorage.getItem(key);
return item?JSON.parse(item):null;
}