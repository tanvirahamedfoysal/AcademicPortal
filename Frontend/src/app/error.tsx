// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Global application crash:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <Card className="max-w-md w-full border-red-100 shadow-md">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto bg-red-100 text-red-600 w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <AlertOctagon size={32} />
          </div>
          <CardTitle className="text-xl text-slate-900">
            Something went wrong
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center pb-6">
          <p className="text-sm text-slate-600 mb-4">
            We encountered an unexpected error while trying to load this page. 
          </p>
          {}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-slate-100 p-3 rounded-md text-left overflow-x-auto text-xs font-mono text-red-800 border border-red-200">
              {error.message || 'Unknown error occurred'}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center border-t-0 pb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Home size={16} />
            Return Home
          </Button>
          <Button 
            variant="primary" 
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}