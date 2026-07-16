import StatCard from '@/components/dashboard/StatCard';
import Sidebar from '@/components/layout/Sidebar';

export default function Dashboard(){
return <div className="flex">
<Sidebar/>
<main className="p-8 flex-1">
<h1 className="text-3xl font-bold">Admin Dashboard</h1>

<div className="grid md:grid-cols-4 gap-5 mt-8">
<StatCard title="Pending Registrations" value="18"/>
<StatCard title="Draft Articles" value="7"/>
<StatCard title="Unread Messages" value="12"/>
<StatCard title="Active Researchers" value="84"/>
</div>

<div className="bg-white rounded-xl border mt-8 p-6">
<h2 className="font-bold text-xl">Recent Activity</h2>
<ul className="mt-4 space-y-3">
<li>Moderator verified student profile</li>
<li>New research article submitted</li>
<li>Repository document uploaded</li>
</ul>
</div>
</main>
</div>
}