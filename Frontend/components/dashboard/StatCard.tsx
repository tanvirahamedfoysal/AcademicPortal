export default function StatCard({title,value}:{title:string,value:string}){
return <div className="bg-white rounded-xl border p-5">
<div className="text-sm text-gray-500">{title}</div>
<div className="text-3xl font-bold mt-2">{value}</div>
</div>
}