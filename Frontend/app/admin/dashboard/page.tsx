import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/dashboard/StatCard";

export default function AdminDashboard(){

return <div className="flex">

<Sidebar/>

<main className="flex-1 p-10">

<h1 className="text-4xl font-bold">
Welcome Admin
</h1>

<p className="text-slate-500 mt-2">
Research management overview
</p>

<div className="grid md:grid-cols-4 gap-6 mt-10">
<StatCard title="Students" value="842"/>
<StatCard title="Researchers" value="126"/>
<StatCard title="Articles" value="540"/>
<StatCard title="Documents" value="12000"/>
</div>


<div className="grid md:grid-cols-2 gap-6 mt-10">

<div className="panel">
<h2 className="text-xl font-bold">
Student Verification Queue
</h2>

<table className="w-full mt-5">
<tbody>
<tr><td>Ahmed Karim</td><td>Pending</td></tr>
<tr><td>Maria Islam</td><td>Active</td></tr>
</tbody>
</table>

</div>


<div className="panel">
<h2 className="text-xl font-bold">
Recent Activity
</h2>

<ul className="mt-5 space-y-3">
<li>New article submitted</li>
<li>Repository updated</li>
<li>Researcher profile verified</li>
</ul>

</div>

</div>

</main>
</div>
}