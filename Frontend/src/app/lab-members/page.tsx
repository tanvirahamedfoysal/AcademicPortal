import { cookies } from 'next/headers';
import LabMembersTabs from '../../components/public/LabMembersTabs';
import MainLayout from '../../components/MainLayout';
import { getLabMemberDirectory } from '../../lib/public-api';

export const metadata = {
  title: 'Lab Members',
  description: 'Current students, alumni and contributors connected to Dr. Tania Islam’s academic work.',
};

export default async function LabMembersPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value || null;
  const { members, alumni } = await getLabMemberDirectory(accessToken);

  return (
    <MainLayout>
      <section className="border-b border-[#dce7ee] bg-[#dff7f6]">
        <div className="page-shell py-8 sm:py-10 lg:py-12">
          <div className="max-w-4xl">
            <p className="eyebrow">Community</p>
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Lab members, alumni and contributors.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Students, alumni and developers connected with the research portal.</p>
          </div>
        </div>
      </section>
      <LabMembersTabs members={members} alumni={alumni} />
    </MainLayout>
  );
}
