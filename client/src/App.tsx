import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import AuthPage from "@/pages/auth-page";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import { lazy, Suspense } from "react";

// Dynamic imports for admin pages
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/users"));
const AdminCards = lazy(() => import("./pages/admin/cards"));
const AdminLinks = lazy(() => import("./pages/admin/links"));

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-16">
        <Switch>
          {/* Public routes */}
          <Route path="/auth" component={AuthPage} />
          
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
          
          {/* 404 Route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
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
