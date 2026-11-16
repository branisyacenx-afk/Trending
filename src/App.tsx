import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import SetupPage from '@/pages/SetupPage';
import SupportPage from '@/pages/SupportPage';
import PerformancePage from '@/pages/PerformancePage';
import RiskPage from '@/pages/RiskPage';
import AdminPage from '@/pages/AdminPage';
import type { Page } from '@/types';

function AppContent() {
  const { page } = useRouter();
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  const noNavPages: Page[] = ['login', 'signup'];
  const showNav = !noNavPages.includes(page);
  const showFooter = !noNavPages.includes(page);

  // If user is logged in and on login/signup page, redirect to dashboard
  if (session && (page === 'login' || page === 'signup')) {
    return (
      <div className="min-h-screen bg-[#0a1628]" dir="rtl">
        <Navbar />
        <DashboardPage />
        <Footer />
      </div>
    );
  }

  // Protected pages: require session. If no session, show login.
  const protectedPages: Page[] = ['dashboard', 'admin', 'performance'];
  if (protectedPages.includes(page) && !session) {
    return (
      <div className="min-h-screen bg-[#0a1628]" dir="rtl">
        <Navbar />
        <LoginPage />
      </div>
    );
  }

  // Admin page: require admin
  if (page === 'admin' && profile && !profile.is_admin) {
    return (
      <div className="min-h-screen bg-[#0a1628]" dir="rtl">
        <Navbar />
        <DashboardPage />
        <Footer />
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'setup':
        return <SetupPage />;
      case 'support':
        return <SupportPage />;
      case 'performance':
        return <PerformancePage />;
      case 'risk':
        return <RiskPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628]" dir="rtl">
      {showNav && <Navbar />}
      <main>{renderPage()}</main>
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}
