import Navbar from '@/components/v1/navbar';

import { AppSidebar } from '@/components/v1/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface RoutesLayoutProps {
  children: React.ReactNode;
}

const RoutesLayout: React.FC<RoutesLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={false}> 
      <AppSidebar />
      <main className="w-full"> 
        <Navbar />
        <div className='mt-14'>
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default RoutesLayout;
