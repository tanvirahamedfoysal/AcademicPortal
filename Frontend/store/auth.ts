import {create} from 'zustand';

export const useAuth=create<any>((set)=>({
user:null,
setUser:(user:any)=>set({user}),
logout:()=>set({user:null})
}));