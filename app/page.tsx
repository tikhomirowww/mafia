import { LangProvider } from "@/context/LangContext";
import { BookingProvider } from "@/context/BookingContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import HowItWorks from "@/components/HowItWorks";
import LonePlayer from "@/components/LonePlayer";
import Booking from "@/components/Booking";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <LangProvider>
      <BookingProvider>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Pricing />
        <HowItWorks />
        <LonePlayer />
        <Booking />
        <Testimonials />
        <FAQ />
        <Contacts />
      </main>
      <Footer />
      <WhatsAppButton />
      </BookingProvider>
    </LangProvider>
  );
}
