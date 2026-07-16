import Link from "next/link";

export default function Home(){
return <main>
<section className="min-h-screen flex items-center justify-center px-10 bg-gradient-to-br from-blue-50 to-white">
<div className="max-w-5xl text-center">
<div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
University Research Ecosystem
</div>

<h1 className="text-6xl font-bold mt-8">
Academic Research Portal
</h1>

<p className="text-xl text-gray-600 mt-6">
A unified platform for researchers, students, publications,
laboratories and academic collaboration.
</p>

<div className="mt-10 flex justify-center gap-4">
<Link href="/admin/dashboard"
className="bg-blue-600 text-white px-8 py-4 rounded-xl">
Admin Portal
</Link>

<Link href="/student/dashboard"
className="border px-8 py-4 rounded-xl">
Student Portal
</Link>
</div>
</div>
</section>
</main>
}