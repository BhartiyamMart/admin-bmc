import Navbar from '@/components/v1/navbar';
import { AppSidebar } from '@/components/v1/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import ProtectedRoute from '@/components/v1/auth/protected';
import SidebarData from '@/components/v1/auth/sidebardata';

interface RoutesLayoutProps {
  children: React.ReactNode;
}

const RoutesLayout: React.FC<RoutesLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className="flex h-screen w-full flex-1 flex-col overflow-hidden">
          <Navbar />
          <SidebarData />
          <div className="mt-14 flex-2 overflow-auto">{children}</div>
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default RoutesLayout;
