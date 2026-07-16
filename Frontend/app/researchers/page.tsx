const researchers=[
["Dr. Ahmed Rahman","Artificial Intelligence"],
["Dr. Sara Khan","Biotechnology"],
["Dr. Hasan Ali","Data Science"]
];

export default function Researchers(){

return <main className="p-10">

<h1 className="text-4xl font-bold">
Researcher Directory
</h1>

<div className="grid md:grid-cols-3 gap-6 mt-10">

{researchers.map(r=>
<div className="panel" key={r[0]}>
<h2 className="font-bold text-xl">{r[0]}</h2>
<p className="text-slate-500 mt-2">{r[1]}</p>
<button className="mt-5 bg-blue-600 text-white px-4 py-2 rounded">
View Profile
</button>
</div>
)}

</div>

</main>
}