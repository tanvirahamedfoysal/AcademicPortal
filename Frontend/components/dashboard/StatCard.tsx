export default function StatCard({title,value}:{title:string,value:string}){
return <div className="panel">
<p className="text-slate-500">{title}</p>
<h2 className="text-4xl font-bold text-blue-600 mt-3">
{value}
</h2>
</div>
}