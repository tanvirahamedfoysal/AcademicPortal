import { AtSign, GraduationCap, Mail, MapPin, Phone, UsersRound } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import { getLabMembers } from '../../lib/public-api';

export const metadata = {
  title: 'Lab Members',
  description: 'Students and researchers connected to Dr. Tania Islam’s lab and academic work.',
};

export default async function LabMembersPage() {
  const members = await getLabMembers();

  return (
    <MainLayout>
      <section className="border-b border-[#dce7ee] bg-[#dff7f6]">
        <div className="page-shell py-14 sm:py-16 lg:py-20">
          <div className="max-w-4xl">
            <p className="eyebrow">Lab members</p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">People working and learning in the lab.</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">Profiles of active lab members, including their academic batch, contact information and research background where available.</p>
          </div>
        </div>
      </section>

      <section className="page-shell py-12 sm:py-14 lg:py-20">
        {members.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <article key={member.uuid} className="academic-card overflow-hidden">
                <div className="flex items-start gap-4 border-b border-[#e3edf2] bg-[linear-gradient(135deg,#fffdfb_0%,#edf6ff_100%)] p-5 sm:p-6">
                  {member.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.image_url} alt={member.name} className="h-20 w-20 shrink-0 rounded-2xl border border-[#dce7ee] bg-white object-contain" />
                  ) : (
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#dff7f6] font-serif text-2xl font-bold text-[#527f8f]">{member.name.slice(0, 2).toUpperCase()}</span>
                  )}
                  <div className="min-w-0 pt-1">
                    <h2 className="break-words font-serif text-xl font-bold tracking-[-0.02em] text-slate-900 sm:text-2xl">{member.name}</h2>
                    <p className="mt-1 flex items-center gap-1.5 break-all text-sm text-slate-500"><AtSign className="h-3.5 w-3.5 shrink-0" />{member.username}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#dff7f6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#527f8f]"><GraduationCap className="h-3.5 w-3.5" />{member.student_batch ? `Batch ${member.student_batch}` : 'Lab member'}</span>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  {member.bio ? <p className="text-sm leading-7 text-slate-600">{member.bio}</p> : <p className="text-sm leading-7 text-slate-400">Profile details have not been added yet.</p>}

                  <dl className="grid gap-3 border-t border-[#e6eef2] pt-5 text-sm">
                    <div className="grid grid-cols-[28px_1fr] items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-[#689aa6]" /><div><dt className="sr-only">Email</dt><dd className="break-all text-slate-600"><a href={`mailto:${member.email}`} className="hover:text-[#527f8f]">{member.email}</a></dd></div></div>
                    {member.mobile_number ? <div className="grid grid-cols-[28px_1fr] items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-[#689aa6]" /><div><dt className="sr-only">Phone</dt><dd className="break-words text-slate-600"><a href={`tel:${member.mobile_number}`} className="hover:text-[#527f8f]">{member.mobile_number}</a></dd></div></div> : null}
                    {member.address ? <div className="grid grid-cols-[28px_1fr] items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[#689aa6]" /><div><dt className="sr-only">Address</dt><dd className="break-words text-slate-600">{member.address}</dd></div></div> : null}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="academic-card px-6 py-16 text-center"><UsersRound className="mx-auto h-9 w-9 text-[#689aa6]" /><h2 className="mt-5 font-serif text-2xl font-bold">No lab member profiles are available yet</h2><p className="mt-3 text-sm text-slate-500">Active member profiles will appear here.</p></div>
        )}
      </section>
    </MainLayout>
  );
}
