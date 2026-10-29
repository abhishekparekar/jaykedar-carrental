import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';

// Protected Route Guard
import ProtectedRoute from './components/guards/ProtectedRoute';

// UI Components
import WhatsAppButton from './components/ui/WhatsAppButton';

// Public Pages
import HomePage from './pages/public/HomePage';
import FleetPage from './pages/public/FleetPage';
import CarDetailPage from './pages/public/CarDetailPage';
import ContactPage from './pages/public/ContactPage';
import AboutPage from './pages/public/AboutPage';
import MyInquiriesPage from './pages/public/MyInquiriesPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCars from './pages/admin/AdminCars';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminExpenses from './pages/admin/AdminExpenses';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSettings from './pages/admin/AdminSettings';

// Auto Scroll To Top Hero section on Route Change & Query Search Params
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <TenantProvider>
          <BrowserRouter>
            <ScrollToTop />

            {/* Global Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#FFFFFF',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                },
              }}
            />

            {/* Floating Action Button */}
            <WhatsAppButton />

            <Routes>
              {/* 🌐 Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/fleet" element={<FleetPage />} />
              <Route path="/cars" element={<FleetPage />} />
              <Route path="/cars/:carId" element={<CarDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/my-inquiries" element={<MyInquiriesPage />} />

              {/* 🔐 Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/cars"
                element={
                  <ProtectedRoute>
                    <AdminCars />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/inquiries"
                element={
                  <ProtectedRoute>
                    <AdminInquiries />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute>
                    <AdminInquiries />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute>
                    <AdminCustomers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/expenses"
                element={
                  <ProtectedRoute>
                    <AdminExpenses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/inventory"
                element={
                  <ProtectedRoute>
                    <AdminInventory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback: Automatically opens Home Page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TenantProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
