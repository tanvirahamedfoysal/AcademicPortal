export async function checkUpdate(
key:string,
updatedAt:string,
fetcher:any
){
const version=localStorage.getItem(key+'_version');

if(version===updatedAt){
return JSON.parse(localStorage.getItem(key)||'null');
}

const fresh=await fetcher();

localStorage.setItem(key,JSON.stringify(fresh));
localStorage.setItem(key+'_version',updatedAt);

return fresh;
}