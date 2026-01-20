import { useState } from "react";
import Header from "@/components/Header";
import CasinosSection from "@/components/CasinosSection";
import SocialLinks from "@/components/SocialLinks";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AppSidebar from "@/components/AppSidebar";
import SidebarTrigger from "@/components/SidebarTrigger";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SidebarTrigger onClick={() => setSidebarOpen(true)} />
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Header />
      <CasinosSection />
      <SocialLinks />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
