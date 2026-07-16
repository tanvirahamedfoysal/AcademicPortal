export default function AdminSidebar(){
const items=['Dashboard','Students','Articles','Repository','Moderators','Collaborators','Audit Logs','Settings'];

return <aside className="w-64 min-h-screen bg-white border-r p-5">
<h2 className="font-bold text-xl mb-8">Academic Admin</h2>
{items.map(i=><div key={i} className="py-3">{i}</div>)}
</aside>
}