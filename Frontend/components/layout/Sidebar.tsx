const links=[
"Dashboard",
"Students",
"Researchers",
"Articles",
"Repository",
"Messages",
"Audit Logs",
"Settings"
];

export default function Sidebar(){
return <aside className="w-72 min-h-screen bg-white border-r p-8">
<h1 className="text-xl font-bold text-blue-600">
Academic Portal
</h1>

<div className="mt-10 space-y-3">
{links.map(x=>
<div key={x}
className="p-3 rounded-lg hover:bg-blue-50">
{x}
</div>)}
</div>
</aside>
}