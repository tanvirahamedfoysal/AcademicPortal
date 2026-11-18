'use client';

import { useState } from 'react';
import { AtSign, Mail, MapPin, Phone, UsersRound } from 'lucide-react';
import SpecialThanksDevelopers from './SpecialThanksDevelopers';
import type { PublicLabMember } from '../../types/public';

type Tab = 'members' | 'alumni' | 'thanks';

function ProfileCards({ profiles, emptyMessage }: { profiles: PublicLabMember[]; emptyMessage: string }) {
  if (!profiles.length) {
    return <div className="academic-card px-6 py-14 text-center text-sm text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {profiles.map((profile) => (
        <article key={profile.uuid} className="academic-card overflow-hidden">
          <div className="flex items-start gap-3 border-b border-[#e3edf2] bg-[#edf6ff] p-4">
            {profile.image_url ? (
              <img src={profile.image_url} alt={profile.name || 'Profile'} className="h-20 w-20 shrink-0 rounded-xl bg-white object-contain" />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#dff7f6] font-serif text-xl font-bold">
                {(profile.name || 'U').slice(0, 2)}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="font-serif text-xl font-bold">{profile.name || 'Student'}</h3>
              {profile.username && <p className="mt-1 text-xs text-slate-500"><AtSign className="inline h-3 w-3" />{profile.username}</p>}
              <span className="mt-2 inline-flex rounded-full bg-[#dff7f6] px-2 py-1 text-[10px] font-bold uppercase">
                {profile.student_batch ? `Batch ${profile.student_batch}` : 'Academic community'}
              </span>
            </div>
          </div>
          <div className="space-y-3 p-4 text-sm">
            {profile.bio && <p className="leading-6 text-slate-600">{profile.bio}</p>}
            {profile.email && <p className="break-all"><Mail className="mr-2 inline h-4 w-4" />{profile.email}</p>}
            {profile.mobile_number && <p><Phone className="mr-2 inline h-4 w-4" />{profile.mobile_number}</p>}
            {profile.address && <p><MapPin className="mr-2 inline h-4 w-4" />{profile.address}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function LabMembersTabs({
  members,
  alumni,
}: {
  members: PublicLabMember[];
  alumni: PublicLabMember[];
}) {
  const [tab, setTab] = useState<Tab>('members');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'members', label: 'Lab Members' },
    { id: 'alumni', label: 'Alumni' },
    { id: 'thanks', label: 'Special Thanks' },
  ];

  return (
    <section className="page-shell py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-[#dce7ee] bg-white p-2">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === id ? 'bg-[#dff7f6] text-[#527f8f]' : 'text-slate-500 hover:bg-[#edf6ff]'}`}
          >
            {label}
            {id === 'alumni' && alumni.length > 0 ? ` (${alumni.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'thanks' && <SpecialThanksDevelopers />}

      {tab === 'alumni' && (
        <>
          <div className="mb-6">
            <p className="eyebrow">Alumni</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Our alumni</h2>
            <p className="mt-2 text-sm text-slate-500">Former students recognized by the research portal.</p>
          </div>
          {alumni.length ? (
            <ProfileCards profiles={alumni} emptyMessage="No alumni profiles have been added yet." />
          ) : (
            <div className="academic-card px-6 py-16 text-center">
              <UsersRound className="mx-auto h-8 w-8 text-[#689aa6]" />
              <h2 className="mt-4 font-serif text-2xl font-bold">Alumni</h2>
              <p className="mt-2 text-sm text-slate-500">Alumni profiles will appear here when an Admin or Moderator marks a student as an alumnus.</p>
            </div>
          )}
        </>
      )}

      {tab === 'members' && (
        <>
          <div className="mb-6">
            <p className="eyebrow">Lab members</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Current student profiles</h2>
          </div>
          <ProfileCards profiles={members} emptyMessage="No current student lab members yet." />
        </>
      )}
    </section>
  );
}
