import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MobileNav } from "./components/MobileNav";
import { PageTransition } from "./components/PageTransition";
import { ScrollToTop } from "./components/ScrollToTop";
import { AIChatbot } from "./components/AIChatbot";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ImpersonationProvider } from "./contexts/ImpersonationContext";
import { AdminLayout } from "./components/admin/AdminLayout";

// Lazy load route components for better code splitting
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const WhatWeDo = lazy(() => import("./pages/WhatWeDo"));
const Products = lazy(() => import("./pages/Products"));
const Capabilities = lazy(() => import("./pages/Capabilities"));
const Clients = lazy(() => import("./pages/Clients"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Calculator = lazy(() => import("./pages/Calculator"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const DashboardOverview = lazy(() => import("./components/admin/DashboardOverview").then(module => ({ default: module.DashboardOverview })));
const Leads = lazy(() => import("./pages/Admin/Leads"));
const Gallery = lazy(() => import("./pages/Admin/Gallery"));
const ProductImageProcessor = lazy(() => import("./pages/ProductImageProcessor"));
const LinkedInCarousel = lazy(() => import("./pages/LinkedInCarousel"));
const ProductAssets = lazy(() => import("./pages/Admin/ProductAssets"));
const EnvironmentAssets = lazy(() => import("./pages/Admin/EnvironmentAssets"));
const KnowledgeBase = lazy(() => import("./pages/Admin/KnowledgeBase"));
const RejectionAnalytics = lazy(() => import("./pages/Admin/RejectionAnalytics"));

// Public Pages
const ProductCatalog = lazy(() => import("./pages/ProductCatalog"));
const PitchDeck = lazy(() => import("./pages/PitchDeck"));

const queryClient = new QueryClient();

// Main Layout Wrapper
const MainLayout = () => (
  <div className="flex flex-col min-h-screen overflow-x-hidden">
    <Header />
    <main className="flex-1 w-full">
      <PageTransition>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
          <Outlet />
        </Suspense>
      </PageTransition>
    </main>
    <Footer />
    <MobileNav />
    <ScrollToTop />
    {/* <AIChatbot /> */}
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <ImpersonationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Routes with Main Layout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/what-we-do" element={<WhatWeDo />} />
                <Route path="/products" element={<Products />} />
                <Route path="/capabilities" element={<Capabilities />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/product-catalog" element={<ProductCatalog />} />
                <Route path="/pitch-deck" element={<PitchDeck />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/admin" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminLayout>
                    <Outlet />
                  </AdminLayout>
                </Suspense>
              }>
                <Route index element={<DashboardOverview />} />
                <Route path="leads" element={<Leads />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="image-processor" element={<ProductImageProcessor />} />
                <Route path="linkedin-carousel" element={<LinkedInCarousel />} />
                <Route path="product-assets" element={<ProductAssets />} />
                <Route path="environment-assets" element={<EnvironmentAssets />} />
                <Route path="knowledge-base" element={<KnowledgeBase />} />
                <Route path="rejection-analytics" element={<RejectionAnalytics />} />
                {/* Future routes: blogs, etc. */}
              </Route>
            </Routes>
          </BrowserRouter>
        </ImpersonationProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
