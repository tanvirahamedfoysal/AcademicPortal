import Sidebar from "@/components/layout/Sidebar";
import Metric from "@/components/dashboard/Metric";

export default function Dashboard(){

return <div className="flex">

<Sidebar/>

<main className="flex-1 p-10">

<h1 className="text-4xl font-bold">
Welcome Admin 👋
</h1>

<p className="text-gray-500 mt-2">
Research management overview
</p>

<div className="grid grid-cols-4 gap-6 mt-10">
<Metric title="Students" value="842" icon="👨‍🎓"/>
<Metric title="Researchers" value="126" icon="🔬"/>
<Metric title="Articles" value="540" icon="📄"/>
<Metric title="Documents" value="1200" icon="📚"/>
</div>


<div className="grid grid-cols-2 gap-8 mt-10">

<div className="card">
<h2 className="font-bold text-xl">
Recent Activity
</h2>
<ul className="mt-5 space-y-4">
<li>New article submitted</li>
<li>Student verification completed</li>
<li>Repository updated</li>
</ul>
</div>


<div className="card">
<h2 className="font-bold text-xl">
Active Notices
</h2>

<div className="mt-5 bg-blue-50 p-4 rounded-xl">
Research seminar tomorrow
</div>

<div className="mt-3 bg-blue-50 p-4 rounded-xl">
New registration opened
</div>

</div>

</div>

</main>
</div>
}