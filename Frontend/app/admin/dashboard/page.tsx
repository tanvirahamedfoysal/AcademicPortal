export default function AdminDashboard(){
 const cards=[
  ['Pending Registrations','18'],
  ['Draft Articles','7'],
  ['Unread Messages','12'],
  ['Active Lab Members','84']
 ];
 return (
 <main className="p-8">
  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
  <div className="grid md:grid-cols-4 gap-5 mt-8">
   {cards.map(c=>
    <div className="border rounded-xl p-5" key={c[0]}>
     <p className="text-gray-500">{c[0]}</p>
     <h2 className="text-3xl font-bold text-blue-600">{c[1]}</h2>
    </div>
   )}
  </div>
 </main>
 )
}
