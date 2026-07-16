import Link from 'next/link';

export default function Home(){
return <main className="p-10">
<h1 className="text-4xl font-bold">Academic Research Portal</h1>
<p className="mt-3 text-gray-600">
Research, publications, laboratory and university collaboration platform.
</p>
<div className="mt-8 flex gap-4">
<Link className="bg-blue-600 text-white px-5 py-3 rounded-lg" href="/auth/login">
Login
</Link>
<Link className="border px-5 py-3 rounded-lg" href="/articles">
Explore Research
</Link>
</div>
</main>
}