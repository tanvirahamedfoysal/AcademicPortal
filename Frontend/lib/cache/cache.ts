export function saveCache(key:string,data:any,version:string){
localStorage.setItem(key,JSON.stringify(data));
localStorage.setItem(key+"_version",version);
}

export function needsUpdate(key:string,version:string){
return localStorage.getItem(key+"_version")!==version;
}