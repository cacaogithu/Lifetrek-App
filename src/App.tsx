import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MobileNav } from "./components/MobileNav";
import { PageTransition } from "./components/PageTransition";
import { ScrollToTop } from "./components/ScrollToTop";
import { AIChatbot } from "./components/AIChatbot";
import { LoadingSpinner } from "./components/LoadingSpinner";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="flex flex-col min-h-screen overflow-x-hidden">
            <Header />
            <main className="flex-1 w-full">
              <PageTransition>
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/what-we-do" element={<WhatWeDo />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/capabilities" element={<Capabilities />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/assessment" element={<Assessment />} />
                    <Route path="/calculator" element={<Calculator />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/product-catalog" element={<ProductCatalog />} />
                    <Route path="/admin/image-processor" element={<ProductImageProcessor />} />
                    <Route path="/admin/linkedin-carousel" element={<LinkedInCarousel />} />
                    <Route path="/admin/assets" element={<AssetLibrary />} />
                    <Route path="/pitch-deck" element={<PitchDeck />} />
                    <Route path="/ev" element={<SalesEngineerDashboard />} />
                    <Route path="/admin/content-approval" element={<ContentApproval />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PageTransition>
            </main>
            <Footer />
            <MobileNav />
            <ScrollToTop />
            {/* <AIChatbot /> */}
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
