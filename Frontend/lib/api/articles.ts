import {api} from './client';

export async function getPublicArticles(){
const res=await api.get('/articles/public');
return res.data;
}