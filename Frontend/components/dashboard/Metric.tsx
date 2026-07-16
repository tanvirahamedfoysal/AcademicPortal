export default function Metric({title,value,icon}:{title:string,value:string,icon:string}){
return <div className="card">
<div className="text-2xl">{icon}</div>
<p className="text-gray-500 mt-4">{title}</p>
<h2 className="text-4xl font-bold text-blue-600">{value}</h2>
</div>
}