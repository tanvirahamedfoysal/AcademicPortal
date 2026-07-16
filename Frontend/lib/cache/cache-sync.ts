export async function syncWithUpdatedAt(
key:string,
updatedAt:string,
fetcher:()=>Promise<any>
){

const storedVersion=localStorage.getItem(key+'_version');

if(storedVersion===updatedAt){
return JSON.parse(localStorage.getItem(key)||'null');
}

const data=await fetcher();

localStorage.setItem(key,JSON.stringify(data));
localStorage.setItem(key+'_version',updatedAt);

return data;
}