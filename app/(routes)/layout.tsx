import Navbar from '@/components/v1/navbar';

import { AppSidebar } from '@/components/v1/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import ProtectedRoute from '@/components/v1/auth/protected';

interface RoutesLayoutProps {
  children: React.ReactNode;
}

const RoutesLayout: React.FC<RoutesLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <div className="mt-14">{children}</div>
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default RoutesLayout;
