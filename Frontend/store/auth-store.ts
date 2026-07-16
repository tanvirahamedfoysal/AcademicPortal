import {create} from 'zustand';

export const useAuthStore=create<any>((set)=>({
 user:null,
 setUser:(user:any)=>set({user})
}));
