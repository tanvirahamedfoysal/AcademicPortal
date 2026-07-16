import StatCard from '@/components/dashboard/StatCard';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function Page(){
return <div className="flex">
<AdminSidebar/>
<main className="p-8 flex-1">
<h1 className="text-3xl font-bold">Dashboard</h1>

<div className="grid md:grid-cols-4 gap-5 mt-8">
<StatCard title="Students" value="0"/>
<StatCard title="Articles" value="0"/>
<StatCard title="Documents" value="0"/>
<StatCard title="Messages" value="0"/>
</div>

<div className="bg-white border rounded-xl p-6 mt-8">
<h2 className="font-bold">Recent Activity</h2>
<p className="mt-3 text-gray-500">Connected to FastAPI audit system.</p>
</div>
</main>
</div>
}