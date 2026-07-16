import Link from 'next/link';

export default function Home(){
return <main className="p-10">
<h1 className="text-4xl font-bold">Academic Research Portal</h1>
<p className="mt-4 text-gray-600">
University researchers, publications and academic resources.
</p>
<div className="mt-8 flex gap-4">
<Link href="/login" className="bg-blue-600 text-white px-5 py-3 rounded-lg">Login</Link>
<Link href="/articles" className="border px-5 py-3 rounded-lg">Research</Link>
</div>
</main>
}