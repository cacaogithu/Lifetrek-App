import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MobileNav } from "./components/MobileNav";
import { PageTransition } from "./components/PageTransition";
import { ScrollToTop } from "./components/ScrollToTop";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ProductCatalog = lazy(() => import("./pages/ProductCatalog"));
const ProductImageProcessor = lazy(() => import("./pages/ProductImageProcessor"));
const LinkedInCarousel = lazy(() => import("./pages/LinkedInCarousel"));
const AssetLibrary = lazy(() => import("./pages/AssetLibrary"));
const PitchDeck = lazy(() => import("./pages/PitchDeck"));
const SalesEngineerDashboard = lazy(() => import("./pages/SalesEngineerDashboard"));
const ContentApproval = lazy(() => import("./pages/ContentApproval"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const KnowledgeBase = lazy(() => import("./pages/Admin/KnowledgeBase"));
const ProductAssets = lazy(() => import("./pages/Admin/ProductAssets"));
const EnvironmentAssets = lazy(() => import("./pages/Admin/EnvironmentAssets"));
const RejectionAnalytics = lazy(() => import("./pages/Admin/RejectionAnalytics"));

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") && location.pathname !== "/admin/login";

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      }
    >
      {isAdminRoute ? (
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/product-assets" element={<ProductAssets />} />
              <Route path="/admin/environment-assets" element={<EnvironmentAssets />} />
              <Route path="/admin/image-processor" element={<ProductImageProcessor />} />
              <Route path="/admin/linkedin-carousel" element={<LinkedInCarousel />} />
              <Route path="/admin/assets" element={<AssetLibrary />} />
              <Route path="/admin/content-approval" element={<ContentApproval />} />
              <Route path="/admin/blog" element={<AdminBlog />} />
              <Route path="/admin/rejection-analytics" element={<RejectionAnalytics />} />
              <Route path="/admin/knowledge-base" element={<KnowledgeBase />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      ) : (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
          <Header />
          <main className="flex-1 w-full">
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/what-we-do" element={<WhatWeDo />} />
                <Route path="/products" element={<Products />} />
                <Route path="/capabilities" element={<Capabilities />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/product-catalog" element={<ProductCatalog />} />
                <Route path="/pitch-deck" element={<PitchDeck />} />
                <Route path="/ev" element={<SalesEngineerDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </main>
          <Footer />
          <MobileNav />
          <ScrollToTop />
        </div>
      )}
    </Suspense>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
