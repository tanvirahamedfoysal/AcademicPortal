export default function StatCard({title,value}:{title:string,value:string}){
return <div className="bg-white border rounded-xl p-5 shadow-sm">
<p className="text-gray-500">{title}</p>
<h2 className="text-3xl font-bold text-blue-600">{value}</h2>
</div>
}