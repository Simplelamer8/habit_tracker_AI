import Image from "next/image";
import Footer from "./components/Footer/footer";
import Hero from "./components/HeroSection/Hero";
import Features from "./components/Features/features";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero/>
      <Features/>
      <Footer/>
    </main>
  );
}
