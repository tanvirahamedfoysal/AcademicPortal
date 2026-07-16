export function cacheSync(
key:string,
version:string,
data:any
){
localStorage.setItem(key,JSON.stringify(data));
localStorage.setItem(key+"_version",version);
}