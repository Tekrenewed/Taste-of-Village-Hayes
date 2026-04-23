import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ReactLenis } from 'lenis/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeProvider';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { UpdateBanner } from './components/UpdateBanner';

// ─── Core pages (loaded immediately) ───
import { TOVHome } from './pages/TOVHome';
import { Menu } from './pages/Menu';
import { Login } from './pages/Login';

// ─── Lazy-loaded pages ───
const LazyAdmin = React.lazy(() => import('./pages/AdminPOS').then(m => ({ default: m.Admin })));
const LazyOrder = React.lazy(() => import('./pages/Order').then(m => ({ default: m.Order })));
const LazyTrackOrder = React.lazy(() => import('./pages/TrackOrder').then(m => ({ default: m.TrackOrder })));
const LazyStaffPortal = React.lazy(() => import('./pages/StaffPortal').then(m => ({ default: m.StaffPortal })));
const LazyWaiterPad = React.lazy(() => import('./pages/WaiterPad').then(m => ({ default: m.WaiterPad })));
const LazyKDS = React.lazy(() => import('./pages/KitchenKDS').then(m => ({ default: m.KitchenKDS })));
const LazyCustomerDisplay = React.lazy(() => import('./pages/CustomerDisplay').then(m => ({ default: m.CustomerDisplay })));

// Shared loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="animate-pulse text-pine text-lg font-bold">Loading...</div>
  </div>
);

const AdminLoader = () => (
  <div className="min-h-screen bg-pine flex items-center justify-center">
    <div className="animate-pulse text-cream text-xl font-bold">Loading TOV OS...</div>
  </div>
);

import { useIdleTimeout } from './hooks/useIdleTimeout';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, authLoading, toggleAdmin } = useStore();

  useIdleTimeout({
    onIdle: () => {
      if (isAdmin) {
        console.log('[IdleTimeout] Admin session expired. Logging out.');
        toggleAdmin();
      }
    },
    idleTime: 180000, // 3 minutes
    isActive: isAdmin
  });

  if (authLoading) return <AdminLoader />;
  if (!isAdmin) return <Navigate to="/staff" replace />;
  return <>{children}</>;
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <div className="sticky top-0 z-[60] w-full">
      <Navbar />
    </div>
    {children}
    <Footer />
  </>
);

const LazyPublic = ({ children }: { children: React.ReactNode }) => (
  <PublicLayout>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </PublicLayout>
);

const AppContent = () => {
  return (
    <HelmetProvider>
      <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Core pages */}
            <Route path="/" element={<PublicLayout><TOVHome /></PublicLayout>} />
            <Route path="/menu" element={<PublicLayout><Menu /></PublicLayout>} />
            <Route path="/staff" element={<Login />} />

            {/* Functional pages */}
            <Route path="/order" element={<LazyPublic><LazyOrder /></LazyPublic>} />
            <Route path="/track/:orderId" element={<LazyPublic><LazyTrackOrder /></LazyPublic>} />
            <Route path="/staff-portal" element={<Suspense fallback={<AdminLoader />}><LazyStaffPortal /></Suspense>} />
            <Route path="/waiter" element={<Suspense fallback={<AdminLoader />}><LazyWaiterPad /></Suspense>} />
            <Route path="/kds" element={<Suspense fallback={<AdminLoader />}><LazyKDS /></Suspense>} />
            <Route path="/admin" element={<AdminRoute><Suspense fallback={<AdminLoader />}><LazyAdmin /></Suspense></AdminRoute>} />
            <Route path="/cfd" element={<Suspense fallback={<PageLoader />}><LazyCustomerDisplay /></Suspense>} />
          </Routes>
        </Router>
      </ReactLenis>
    </HelmetProvider>
  );
};

// â”€â”€â”€ Custom Error Boundary (replaces Sentry SDK â€” zero external deps) â”€â”€â”€
class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    // This is automatically captured by our global error handler in sentry.ts
    console.error('[AppCrash]', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8 text-center">
          <span className="text-5xl mb-4">{"\uD83D\uDE14"}</span>
          <h1 className="font-serif text-3xl font-bold text-pine mb-3">Something went wrong</h1>
          <p className="text-pine/60 mb-6 max-w-md">We've been notified and are looking into it. Please try a Hard Refresh to clear the update cache.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="bg-terracotta text-white px-8 py-3 rounded-full font-bold hover:bg-terracotta-light transition-all shadow-lg">
              Refresh Page
            </button>
            <button 
              onClick={() => {
                if (window.confirm('This will clear the app cache and force a fresh download. Recommended if you keep seeing this screen.')) {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
                  }
                  window.location.reload();
                }
              }}
              className="text-pine/40 text-xs font-bold hover:text-pine/60 transition-all"
            >
              Force Hard Reset →
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <AppErrorBoundary>
      <UpdateBanner />
      <AuthProvider>
        <RealtimeProvider>
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        </RealtimeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
};

export default App;