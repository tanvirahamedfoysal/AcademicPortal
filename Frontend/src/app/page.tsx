import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Researcher's Eden
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A centralized platform for academic publications, research collaboration and document management.
        </p>
        
        <div className="flex justify-center gap-4 mt-8">
          {}
          <Link 
            href="/auth/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/public/articles" 
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Browse Articles
          </Link>
        </div>
      </div>
    </main>
  );
}