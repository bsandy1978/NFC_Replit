import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import AuthPage from "@/pages/auth-page";
import PublicCardPage from "@/pages/public-card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import { lazy, Suspense } from "react";
import ClaimNfcCard from "@/pages/claim-nfc-card";
import AdminNavbar from "@/components/layout/admin-navbar";

// Dynamic imports for admin pages
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/users"));
const AdminCards = lazy(() => import("./pages/admin/cards"));
const AdminLinks = lazy(() => import("./pages/admin/links"));
const AdminNfcLinks = lazy(() => import("./pages/admin/generate-nfc-links"));

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow pt-16">
        <AdminNavbar />
        <main className="flex-grow lg:ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  // Check if current path starts with /admin to determine layout
  const currentPath = window.location.pathname;
  const isAdminRoute = currentPath.startsWith('/admin');
  
  const Layout = isAdminRoute ? AdminLayout : DefaultLayout;
  
  return (
    <Layout>
      <Switch>
        {/* Public routes */}
        <Route path="/auth" component={AuthPage} />
        <Route path="/card/:slug">
          {(params) => <PublicCardPage />}
        </Route>
        <Route path="/claim/:slug">
          {(params) => <ClaimNfcCard />}
        </Route>
        
        {/* Protected routes */}
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/editor" component={Editor} />
        <ProtectedRoute path="/editor/:id" component={Editor} />
        
        {/* Admin routes */}
        <ProtectedRoute path="/admin" adminOnly>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AdminDashboard />
          </Suspense>
        </ProtectedRoute>
        <ProtectedRoute path="/admin/users" adminOnly>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AdminUsers />
          </Suspense>
        </ProtectedRoute>
        <ProtectedRoute path="/admin/cards" adminOnly>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AdminCards />
          </Suspense>
        </ProtectedRoute>
        <ProtectedRoute path="/admin/links" adminOnly>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AdminLinks />
          </Suspense>
        </ProtectedRoute>
        <ProtectedRoute path="/admin/nfc-links" adminOnly>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AdminNfcLinks />
          </Suspense>
        </ProtectedRoute>
        
        {/* 404 Route */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;