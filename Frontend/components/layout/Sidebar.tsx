const menu=[
'Dashboard',
'Students',
'Moderators',
'Collaborators',
'Articles',
'Repository',
'Inbox',
'Audit Logs',
'Settings'
];

export default function Sidebar(){
return <aside className="w-64 min-h-screen bg-white border-r p-5">
<h2 className="font-bold text-xl mb-8">Admin Center</h2>
{menu.map(x=><div key={x} className="py-3 text-gray-700">{x}</div>)}
</aside>
}