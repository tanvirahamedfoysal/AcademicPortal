'use client';

export default function Login(){
 return (
  <div className="min-h-screen flex items-center justify-center">
   <div className="border rounded-xl p-8 w-96">
    <h2 className="text-2xl font-bold mb-5">Portal Login</h2>
    <input className="border p-3 w-full mb-3" placeholder="Username"/>
    <input className="border p-3 w-full mb-3" placeholder="Password" type="password"/>
    <button className="bg-blue-600 text-white p-3 rounded w-full">
     Login
    </button>
   </div>
  </div>
 )
}
