import Header from "@/components/Header";
import CasinosSection from "@/components/CasinosSection";
import SocialLinks from "@/components/SocialLinks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CasinosSection />
      <SocialLinks />
      <Footer />
    </div>
  );
};

export default Index;
