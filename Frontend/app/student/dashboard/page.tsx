export default function StudentDashboard(){
 return (
 <main className="p-8">
  <h1 className="text-3xl font-bold">Student Dashboard</h1>
  <div className="mt-6 grid md:grid-cols-3 gap-5">
   <div className="border p-5 rounded-xl">Profile</div>
   <div className="border p-5 rounded-xl">Publications</div>
   <div className="border p-5 rounded-xl">Documents</div>
  </div>
 </main>
 )
}
