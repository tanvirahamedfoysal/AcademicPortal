import Link from "next/link";

const stats=[
["Researchers","126"],
["Publications","540"],
["Documents","12000"],
["Labs","24"]
];

export default function Home(){
return <main>

<section className="min-h-screen p-12 bg-gradient-to-br from-blue-50 via-white to-slate-100">

<div className="max-w-6xl mx-auto">

<span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
University Research Ecosystem
</span>

<h1 className="text-6xl font-bold mt-8">
Academic Research Portal
</h1>

<p className="text-xl text-slate-600 mt-5 max-w-3xl">
A centralized platform for researchers, students, publications,
collaboration and knowledge management.
</p>

<div className="flex gap-4 mt-8">
<Link href="/admin/dashboard"
className="bg-blue-600 text-white px-8 py-4 rounded-xl">
Open Admin Portal
</Link>

<Link href="/researchers"
className="border px-8 py-4 rounded-xl">
Browse Researchers
</Link>
</div>

<div className="grid md:grid-cols-4 gap-5 mt-16">
{stats.map(s=>
<div className="panel" key={s[0]}>
<p className="text-slate-500">{s[0]}</p>
<h2 className="text-4xl font-bold mt-2">{s[1]}</h2>
</div>)}
</div>

</div>
</section>

</main>
}