import { GraduationCap, UsersRound } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import { getStudents } from '../../lib/public-api';

export const metadata = { title: 'Academic Community', description: 'Students and academic community members connected to the portal.' };

export default async function ContributorsPage() {
  const students = await getStudents();

  return (
    <MainLayout>
      <section className="bg-[#e7efe9]">
        <div className="page-shell py-16 lg:py-20">
          <p className="eyebrow">Learning community</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl font-bold tracking-[-0.045em] sm:text-6xl">A portal for the next generation of researchers.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">Students and community members who participate in the academic environment surrounding the research portfolio.</p>
        </div>
      </section>

      <section className="page-shell py-14 lg:py-20">
        {students.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.map((student) => (
              <article key={student.uuid} className="academic-card p-6">
                <div className="flex items-center justify-between gap-4">
                  {student.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={student.image_url} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#153b35] font-serif text-lg font-bold text-white">{student.name.slice(0, 2).toUpperCase()}</span>
                  )}
                  <GraduationCap className="h-5 w-5 text-[#c7a35c]" />
                </div>
                <h2 className="mt-6 font-serif text-xl font-bold tracking-[-0.02em]">{student.name}</h2>
                <p className="mt-1 text-sm text-slate-500">@{student.username}</p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                  <span>{student.student_batch ? `Batch ${student.student_batch}` : 'Academic member'}</span>
                  <span className="rounded-full bg-[#e7efe9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">{student.status || 'Student'}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="academic-card px-6 py-16 text-center"><UsersRound className="mx-auto h-8 w-8 text-emerald-700" /><h2 className="mt-5 font-serif text-2xl font-bold">Community profiles will appear here</h2><p className="mt-3 text-sm text-slate-500">Active student records from the existing API populate this directory automatically.</p></div>
        )}
      </section>
    </MainLayout>
  );
}
