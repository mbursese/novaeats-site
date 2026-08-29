import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { DiscordHome } from "@/components/DiscordHome";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div id="top">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <DiscordHome />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
