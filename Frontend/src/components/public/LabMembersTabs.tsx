"use client";

import { useState } from 'react';
import { AtSign, GraduationCap, Mail, MapPin, Phone, UsersRound } from 'lucide-react';
import SpecialThanksDevelopers from './SpecialThanksDevelopers';

type Member = any;

export default function LabMembersTabs({ members }: { members: Member[] }) {
  const [tab, setTab] = useState<'members'|'alumni'|'thanks'>('members');
  return <section className="page-shell py-8 sm:py-10">
    <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-[#dce7ee] bg-white p-2">
      {[['members','Lab Members'],['alumni','Alumni'],['thanks','Special Thanks']].map(([id,label]) => <button key={id} onClick={()=>setTab(id as any)} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab===id?'bg-[#dff7f6] text-[#527f8f]':'text-slate-500 hover:bg-[#edf6ff]'}`}>{label}</button>)}
    </div>
    {tab==='thanks' && <SpecialThanksDevelopers />}
    {tab==='alumni' && <div className="academic-card px-6 py-16 text-center"><UsersRound className="mx-auto h-8 w-8 text-[#689aa6]"/><h2 className="mt-4 font-serif text-2xl font-bold">Alumni</h2><p className="mt-2 text-sm text-slate-500">Alumni profiles will appear here when added.</p></div>}
    {tab==='members' && <>
      <div className="mb-6"><p className="eyebrow">Lab members</p><h2 className="mt-2 font-serif text-3xl font-bold">Current student profiles</h2></div>
      {members.length ? <div className="grid gap-4 md:grid-cols-2">{members.map((member: Member)=><article key={member.uuid} className="academic-card overflow-hidden"><div className="flex items-start gap-3 border-b border-[#e3edf2] bg-[#edf6ff] p-4">{member.image_url ? <img src={member.image_url} alt={member.name} className="h-20 w-20 shrink-0 rounded-xl object-contain bg-white"/>:<span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#dff7f6] font-serif text-xl font-bold">{member.name.slice(0,2)}</span>}<div className="min-w-0"><h3 className="font-serif text-xl font-bold">{member.name}</h3><p className="mt-1 text-xs text-slate-500"><AtSign className="inline h-3 w-3"/>{member.username}</p><span className="mt-2 inline-flex rounded-full bg-[#dff7f6] px-2 py-1 text-[10px] font-bold uppercase">{member.student_batch || 'Lab member'}</span></div></div><div className="space-y-3 p-4 text-sm">{member.bio && <p className="leading-6 text-slate-600">{member.bio}</p>}<p><Mail className="inline h-4 w-4 mr-2"/>{member.email}</p>{member.mobile_number&&<p><Phone className="inline h-4 w-4 mr-2"/>{member.mobile_number}</p>}{member.address&&<p><MapPin className="inline h-4 w-4 mr-2"/>{member.address}</p>}</div></article>)}</div> : <div className="academic-card px-6 py-14 text-center">No student lab members yet.</div>}
    </>}
  </section>;
}
