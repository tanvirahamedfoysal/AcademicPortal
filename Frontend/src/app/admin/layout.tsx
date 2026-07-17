import { ReactNode } from 'react';
import AdminSidebar from '../../layout/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {}
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col max-w-full overflow-hidden">
        {}
        
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}