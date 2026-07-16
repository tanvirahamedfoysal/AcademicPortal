import {api} from './client';

export async function getPendingStudents(){
const res=await api.get('/students/pending');
return res.data;
}