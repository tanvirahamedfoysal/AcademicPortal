import {api} from './client';

export async function getDocuments(){
const res=await api.get('/repository/documents');
return res.data;
}