"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const testimonialsData = [
  {
    quote:
      "The reading was incredibly detailed and accurate. It felt like the astrologer truly understood my situation and provided insights I hadn't considered before.",
    author: "Sara",
    rating: 5,
  },
  {
    quote:
      "I was skeptical at first, but the personalised approach and human touch made all the difference. The report arrived exactly when promised.",
    author: "Navya",
    rating: 5,
  },
  {
    quote:
      "Finally, an astrology service that doesn't feel generic. The focus on my career questions was exactly what I needed.",
    author: "Prajna",
    rating: 5,
  },
];

export default function Home() {
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [contactFeedback, setContactFeedback] = useState("");

  useEffect(() => {
    // Check if popup was dismissed in last 7 days
    const dismissed = localStorage.getItem("exitPopupDismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShowExitPopup(true);
      }
    };

    // Sticky CTA on scroll
    const handleScroll = () => {
      const heroSection = document.getElementById("hero-section");
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setShowStickyCTA(window.scrollY > heroBottom);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonialsData.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (contactStatus === "loading") return;

    setContactStatus("loading");
    setContactFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send your message right now.");
      }

      setContactStatus("success");
      setContactFeedback("Thank you! Your message has been sent.");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) {
      setContactStatus("error");
      setContactFeedback(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };

  const isContactSubmitting = contactStatus === "loading";

  const handleDismissPopup = () => {
    setShowExitPopup(false);
    localStorage.setItem("exitPopupDismissed", new Date().toISOString());
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDismissPopup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-white text-[#0a0e27]">
      {/* Navigation */}
      <nav className="border-b border-[#e0e0e0] bg-white/98 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <Link href="/" className="group">
              <span className="text-xl md:text-2xl font-serif font-bold bg-gradient-to-r from-[#0a0e27] via-[#6366f1] to-[#0a0e27] bg-clip-text text-transparent group-hover:from-[#6366f1] group-hover:via-[#8b5cf6] group-hover:to-[#6366f1] transition-all duration-300">
                Taravani
              </span>
            </Link>
            <div className="flex gap-5 md:gap-8 items-center">
              <Link href="/about" className="text-sm md:text-base font-medium text-[#0a0e27] hover:text-[#6366f1] transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-sm md:text-base font-medium text-[#0a0e27] hover:text-[#6366f1] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm md:text-base font-medium text-[#0a0e27] hover:text-[#6366f1] transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sticky CTA Header */}
      {showStickyCTA && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-[#e0e0e0] shadow-md z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 md:h-16 gap-4">
              <span className="text-sm sm:text-base font-serif font-semibold text-[#0a0e27]">Taravani</span>
              <Link
                href="/form/step1"
                className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-4 py-2 md:px-6 md:py-2 rounded-full font-medium hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all shadow-sm text-xs sm:text-sm whitespace-nowrap"
              >
                Get My Reading →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero-section" className="relative overflow-hidden pt-12 pb-10 md:pt-16 md:pb-12 min-h-[85vh] md:min-h-[90vh] flex items-center">
        {/* Enhanced Background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fafafa] via-white to-[#f8f9fa]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6366f1]/5 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Enhanced Heading with gradient */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-3 md:mb-4 leading-tight">
                <span className="text-[#0a0e27]">Discover yourself through</span>
                <br />
                <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#6366f1] bg-clip-text text-transparent animate-gradient">
                  the wisdom of the stars
                </span>
          </h1>
            </div>
            
            {/* Enhanced Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-[#4a5568] mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Get a human-written astrology report tailored to your life — <span className="font-medium text-[#0a0e27]">no AI, no templates.</span>
            </p>
            
            {/* Enhanced CTA Button */}
            <div className="relative inline-block mb-6 md:mb-8 group">
              {/* Animated glow effect - pulsing outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#6366f1] rounded-full blur-md opacity-40 group-hover:opacity-60 animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#6366f1] rounded-full blur-sm opacity-30 group-hover:opacity-50"></div>
              
              {/* Shimmer animation overlay - continuous */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
              
              {/* Button */}
              <Link
                href="/form/step1"
                className="relative inline-block bg-gradient-to-b from-[#5b6ee8] via-[#6366f1] to-[#4f46e5] text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-semibold hover:from-[#4f46e5] hover:via-[#5b6ee8] hover:to-[#4338ca] transition-all shadow-xl hover:shadow-2xl text-base md:text-lg border-2 border-[#7c8ef5]/90 hover:border-[#8b9aff] transform hover:scale-105"
              >
                Get My Personal Reading
              </Link>
            </div>
            
            {/* Enhanced Badges */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-4">
              <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 md:px-5 md:py-3 rounded-full shadow-sm border border-[#e5e7eb] hover:shadow-md transition-all w-full sm:w-auto">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <span className="text-xs sm:text-sm md:text-base font-medium text-[#0a0e27] text-left">Delivered within 48 hours</span>
              </div>
              <div className="flex w-full sm:w-auto gap-3">
                <div className="flex-1 sm:flex-auto flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 md:px-5 md:py-3 rounded-full shadow-sm border border-[#e5e7eb] hover:shadow-md transition-all">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-medium text-[#0a0e27] text-left">100% confidential</span>
                </div>
                <div className="flex-1 sm:flex-auto flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 md:px-5 md:py-3 rounded-full shadow-sm border border-[#e5e7eb] hover:shadow-md transition-all">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-medium text-[#0a0e27] text-left">Human-written</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Service */}
      <section className="py-12 md:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-center mb-3 md:mb-4 text-[#0a0e27] px-4">
            Why This Service
          </h2>
          <p className="text-center text-[#4a5568] mb-8 md:mb-12 lg:mb-16 max-w-2xl mx-auto text-base md:text-lg px-4">
            Astrology shouldn't be mystical, confusing, or fear-based. It should be helpful.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                ),
                title: "Human-written reading",
                description: "Every report is written from scratch — no automation, no machine-generated text."
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ),
                title: "Practical & honest insights",
                description: "Clear explanations you can actually apply in your everyday life."
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                ),
                title: "100% confidential & private",
                description: "Your details are stored securely for 30 days for support and then automatically deleted."
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                ),
                title: "Fast delivery within 48 hours",
                description: "You receive a thoughtful, well-written PDF report directly in your inbox."
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-[#f8f9fa] rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all border border-[#e5e7eb]">
                <div className="text-[#6366f1] mb-3 md:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="font-serif font-semibold text-lg md:text-xl mb-2 md:mb-3 text-[#0a0e27]">
                  {benefit.title}
                </h3>
                <p className="text-sm md:text-base text-[#4a5568] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Helps */}
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-white to-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-center mb-3 md:mb-4 text-[#0a0e27] px-4">
            Who This Helps
          </h2>
          <p className="text-center text-[#4a5568] mb-8 md:mb-12 lg:mb-16 max-w-2xl mx-auto text-base md:text-lg px-4">
            Whether you're seeking clarity, direction, or deeper self-understanding
          </p>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Career Seekers",
                description: "Understand your natural strengths and find the right path forward in your professional journey."
              },
              {
                title: "Relationship Explorers",
                description: "Gain insights into your relationship patterns and how to create more meaningful connections."
              },
              {
                title: "Life Transitions",
                description: "Navigate major life changes with clarity and confidence, understanding the timing and opportunities ahead."
              }
            ].map((audience, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all border border-[#e5e7eb]">
                <h3 className="font-serif font-semibold text-xl md:text-2xl mb-3 md:mb-4 text-[#0a0e27]">
                  {audience.title}
                </h3>
                <p className="text-sm md:text-base text-[#4a5568] leading-relaxed">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Report Preview */}
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-white to-[#f8f4ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 md:mb-4 text-[#0a0e27] px-4">
              Sample Report Preview
            </h2>
            <p className="text-center text-[#4a5568] mb-2 max-w-3xl mx-auto text-base md:text-lg px-4">
              See exactly what you'll receive. Here are real excerpts from actual reports—notice the depth, specificity, and personal touch that sets our readings apart.
            </p>
            <p className="text-xs sm:text-sm text-[#6366f1] italic px-4">
              Client name changed for privacy. All astrological insights are from the actual report.
            </p>
          </div>
          
          {/* 3 Excerpt Cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {/* Card 1: Personality Insight */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border-l-4 border-[#8b5cf6]">
              <div className="text-xs md:text-sm font-semibold text-[#8b5cf6] mb-4 uppercase tracking-wide">
                Core Personality Blueprint
              </div>
              <p className="text-sm md:text-base text-[#4a5568] leading-relaxed">
                "Sandip is someone who thrives when he takes charge of his life rather than waiting for circumstances to change on their own. The chart shows a personality built on self-respect, pride, and deep ambition. Recognition matters — not because of insecurity, but because Sandip is{" "}
                <span className="bg-[#e9d5ff] px-1 rounded font-medium">wired to lead, create, and stand out</span>.
              </p>
              <p className="text-sm md:text-base text-[#4a5568] leading-relaxed mt-4">
                There is strong creative intelligence combined with practicality. Decisions are not random — they are evaluated. When focused, Sandip becomes unstoppable; when distracted, inner pressure and impatience can reduce stability."
              </p>
            </div>
            
            {/* Card 2: Career & Success */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border-l-4 border-[#8b5cf6]">
              <div className="text-xs md:text-sm font-semibold text-[#8b5cf6] mb-4 uppercase tracking-wide">
                Career, Growth & Success Indicators
              </div>
              <p className="text-sm md:text-base text-[#4a5568] leading-relaxed">
                "Jupiter and Rahu in the 3rd house give Sandip{" "}
                <span className="bg-[#e9d5ff] px-1 rounded font-medium">remarkable drive, ambition, and courage to take risks</span>. Career success comes through speaking up, taking initiative, accepting leadership, and seizing opportunities rather than waiting for them.
              </p>
              <p className="text-sm md:text-base text-[#4a5568] leading-relaxed mt-4">
                There will be multiple phases of short-distance and foreign travel for work, learning, or growth. Sandip is also likely to excel in areas requiring adaptability, communication, or networking. The chart shows very strong opportunities throughout life — the key is not hesitating when chances appear."
              </p>
            </div>
            
            {/* Card 3: Timing Predictions */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border-l-4 border-[#8b5cf6]">
              <div className="text-xs md:text-sm font-semibold text-[#8b5cf6] mb-4 uppercase tracking-wide">
                Dasha Timing Highlights
              </div>
              <p className="text-sm md:text-base text-[#4a5568] leading-relaxed mb-4">
                "Current Dasha: Venus until 15 September 2026.
              </p>
              <p className="text-sm md:text-base text-[#4a5568] leading-relaxed mb-4">
                This period supports marriage, property decisions, financial gains, and comfort and stability.
              </p>
              <p className="text-sm md:text-base text-[#4a5568] leading-relaxed mb-3">
                High probability for marriage:
              </p>
              <ul className="text-sm md:text-base text-[#4a5568] leading-relaxed space-y-2 mb-4">
                <li>• Before <span className="bg-[#e9d5ff] px-1 rounded font-medium">15 September 2026</span></li>
                <li className="pl-4">or</li>
                <li>• Between <span className="bg-[#e9d5ff] px-1 rounded font-medium">3 January 2027 and 4 July 2027</span></li>
              </ul>
              <p className="text-sm md:text-base text-[#4a5568] leading-relaxed">
                These windows strongly activate supportive relationship energies."
              </p>
            </div>
          </div>
          
          {/* Comparison Box */}
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 shadow-xl border border-[#e5e7eb] mb-12 md:mb-16">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-center mb-8 md:mb-12 text-[#0a0e27]">
              Generic Computer Report vs. Our Human-Written Report
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Left: Generic */}
              <div className="bg-[#f8f9fa] rounded-xl p-6 border-2 border-[#e5e7eb]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">❌</span>
                  <span className="font-semibold text-lg text-[#0a0e27]">Vague & Generic</span>
                </div>
                <ul className="space-y-3 text-sm md:text-base text-[#4a5568]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#dc2626] mt-1">•</span>
                    <span>"You are ambitious and driven"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dc2626] mt-1">•</span>
                    <span>"Career success is likely"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dc2626] mt-1">•</span>
                    <span>"Good time for relationships"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dc2626] mt-1">•</span>
                    <span>"Travel indicated in chart"</span>
                  </li>
                </ul>
              </div>
              
              {/* Right: Our Report */}
              <div className="bg-gradient-to-br from-[#f3e8ff] to-white rounded-xl p-6 border-2 border-[#8b5cf6]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <span className="font-semibold text-lg text-[#0a0e27]">Specific & Actionable</span>
                </div>
                <ul className="space-y-3 text-sm md:text-base text-[#4a5568]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#8b5cf6] mt-1">•</span>
                    <span>"Jupiter and Rahu in 3rd house give you remarkable drive and courage to take risks"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8b5cf6] mt-1">•</span>
                    <span>"Success comes through speaking up, taking initiative, and seizing opportunities"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8b5cf6] mt-1">•</span>
                    <span>"High probability for marriage before 15 Sept 2026 or between 3 Jan - 4 July 2027"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8b5cf6] mt-1">•</span>
                    <span>"Multiple phases of short-distance and foreign travel for work, learning, or growth"</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-semibold hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all shadow-lg hover:shadow-xl text-base md:text-lg">
                Download sample report
              </button>
            </div>
            <p className="text-sm md:text-base text-[#4a5568] max-w-2xl mx-auto px-4">
              This sample is from a real client report. Your report will be equally detailed and personalized to your unique birth chart.
            </p>
          </div>
        </div>
      </section>

      {/* About the Astrologer */}
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-white to-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-center mb-8 md:mb-12 lg:mb-16 text-[#0a0e27] px-4">
              About the Astrologer
            </h2>
            
            <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg border border-[#e5e7eb]">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-6 md:mb-8">
                <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden shadow-lg border-4 border-white">
                  <Image src="/images/astrologer.png" alt="Krishna - Taravani Astrologer" fill className="object-cover" sizes="(max-width: 768px) 128px, 192px" priority />
                </div>
                
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#d4af37] mb-3 md:mb-4">Krishna</h3>
                  <p className="text-base md:text-lg text-[#4a5568] leading-relaxed mb-3 md:mb-4">
                    With 5+ years of experience in traditional Vedic and modern Western astrology, Krishna brings deep knowledge, intuitive understanding, and authentic practice to every chart reading.
                  </p>
                  <p className="text-base md:text-lg text-[#4a5568] leading-relaxed">
                    Certified in both Jyotish (Vedic astrology) and Western astrological traditions, with specialized training in Dasha systems, transit analysis, and remedial astrology.
                  </p>
                </div>
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-[#e5e7eb]">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-serif font-bold text-[#6366f1] mb-1 md:mb-2">100+</div>
                  <div className="text-xs md:text-sm text-[#4a5568]">Readings Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-serif font-bold text-[#6366f1] mb-1 md:mb-2">5+</div>
                  <div className="text-xs md:text-sm text-[#4a5568]">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-serif font-bold text-[#6366f1] mb-1 md:mb-2">4.9/5</div>
                  <div className="text-xs md:text-sm text-[#4a5568]">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4 text-[#0a0e27]">
            What People Say
          </h2>
          <p className="text-center text-[#4a5568] mb-16 max-w-2xl mx-auto text-lg">
            Real experiences from those who've received their personalized readings
          </p>
          
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial) => (
              <div key={testimonial.author} className="bg-gradient-to-br from-white to-[#f8f9fa] rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all border border-[#e5e7eb]">
                <div className="flex gap-1 mb-3 md:mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg key={`${testimonial.author}-desktop-${i}`} className="w-4 h-4 md:w-5 md:h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm md:text-base text-[#4a5568] mb-4 md:mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <p className="text-xs md:text-sm font-semibold text-[#0a0e27]">— {testimonial.author}</p>
              </div>
            ))}
          </div>
          <div className="md:hidden relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${testimonialIndex * 100}%)`,
                }}
              >
                {testimonialsData.map((testimonial) => (
                  <div key={`${testimonial.author}-mobile`} className="min-w-full px-2">
                    <div className="bg-gradient-to-br from-white to-[#f8f9fa] rounded-2xl p-6 shadow-sm border border-[#e5e7eb] h-full">
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <svg key={`${testimonial.author}-mobile-${i}`} className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-[#4a5568] mb-4 leading-relaxed italic">
                        "{testimonial.quote}"
                      </p>
                      <p className="text-xs font-semibold text-[#0a0e27]">— {testimonial.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {testimonialsData.map((_, index) => (
                <button
                  key={`testimonial-dot-mobile-${index}`}
                  type="button"
                  onClick={() => setTestimonialIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${testimonialIndex === index ? "bg-[#6366f1]" : "bg-gray-300"}`}
                  aria-label={`Show testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* CTA after Testimonials */}
          <div className="text-center mt-8 md:mt-12 lg:mt-16 px-4">
            <Link
              href="/form/step1"
              className="inline-block bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-medium hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all shadow-lg hover:shadow-xl text-base md:text-lg"
            >
              Get My Reading →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-[#f8f9fa] to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 shadow-xl border-2 border-[#6366f1] text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-6 md:mb-8 text-[#0a0e27]">
              Complete Astrology Report — <span className="inline-flex items-baseline"><span className="text-2xl sm:text-3xl md:text-4xl leading-none relative" style={{ top: '0.1em' }}>₹</span><span className="text-2xl sm:text-3xl md:text-4xl leading-none">499</span></span>
            </h2>
            
            <div className="text-left mb-6 md:mb-10 space-y-3 md:space-y-4">
              <h3 className="font-serif font-semibold text-lg md:text-xl mb-4 md:mb-6 text-[#0a0e27] text-center">What's included</h3>
              {[
                "2–4 page personalised PDF report",
                "Explanation of your personality, patterns, and emotions",
                "Guidance on career, relationships, health & direction in life",
                "Timeline insights for the next 6–12 months",
                "Written manually — no templates or AI",
                "Delivered within 48 hours"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2 md:gap-3">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#6366f1] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-sm md:text-base text-[#4a5568]">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="mb-6 md:mb-8 space-y-2 md:space-y-3 text-xs sm:text-sm text-[#4a5568]">
              <p>Safe payment through Razorpay · UPI · Cards · Netbanking</p>
              <p>To maintain the quality of writing, we accept only 10 readings per day.</p>
            </div>
            
            {/* Guarantee Line */}
            <div className="bg-gradient-to-br from-[#f4e4bc] to-[#fafafa] border-2 border-[#d4af37] rounded-xl p-4 md:p-6 mb-6 md:mb-8">
              <p className="text-sm md:text-base text-[#0a0e27] font-medium leading-relaxed">
                If the report doesn't resonate with you, we offer a <span className="font-bold">100% money-back guarantee</span> — no questions asked.
              </p>
            </div>
            
            <Link
              href="/form/step1"
              className="block w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-medium hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all shadow-lg hover:shadow-xl text-base md:text-lg"
            >
              Get My Reading for ₹499
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-center mb-8 md:mb-12 text-[#0a0e27] px-4">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4 md:space-y-6">
            {[
              {
                q: "Is there a money-back guarantee?",
                a: "Yes. If your reading doesn't feel helpful or relevant, just reply to the email within 7 days — we'll refund you in full, no questions asked."
              },
              {
                q: "Can you write a report without my exact birth time?",
                a: "Yes. If you're unsure of the exact time, we request an approximate window (for example, morning, afternoon, evening). We'll handle the interpretation accordingly and mention any limitations clearly in your report."
              },
              {
                q: "Is this really written by a human?",
                a: "Absolutely. Every report is written manually by the astrologer — no automation, no AI, and no reuse of previous texts."
              },
              {
                q: "Is this fortune-telling?",
                a: "No. This is self-awareness and life-clarity work, not fortune-telling. There is no fear-based language, miracle claims, or guaranteed events. You get patterns, tendencies, and guidance — not superstition."
              },
              {
                q: "Is my information private?",
                a: "Yes. Your details and report remain securely stored for only 30 days so we can resend it if needed. After that, your data and report are permanently deleted from our database."
              },
              {
                q: "How long will it take to receive my report?",
                a: "You'll receive your personalised report by email within 48 hours of successful payment. During busy days it may take slightly longer, but we'll always keep you informed."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-[#f8f9fa] rounded-xl p-5 md:p-6 shadow-sm border border-[#e5e7eb]">
                <h3 className="font-serif font-semibold text-lg md:text-xl mb-2 md:mb-3 text-[#0a0e27]">{faq.q}</h3>
                <p className="text-sm md:text-base text-[#4a5568] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-[#f8f9fa] to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#8b5cf6] mb-3">Contact</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0a0e27] mb-4">
                Send a message to Taravani
              </h2>
              <p className="text-base md:text-lg text-[#4a5568] leading-relaxed mb-6">
                Have a question before requesting your reading? Share a few details below and I’ll respond within 24 hours.
              </p>
              <div className="space-y-4 text-sm md:text-base text-[#4a5568]">
                <p>
                  <span className="font-semibold text-[#0a0e27]">Office hours:</span> Monday – Saturday, 9 AM – 7 PM IST
                </p>
                <p>
                  <span className="font-semibold text-[#0a0e27]">Response time:</span> Under 24 hours on business days
                </p>
                <p>
                  <span className="font-semibold text-[#0a0e27]">Email:</span> admin@taravani.com
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[#e5e7eb]">
              <form className="space-y-5" onSubmit={handleContactSubmit}>
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366f1] resize-none"
                    placeholder="Tell me how I can help you..."
                  />
                </div>
                {contactFeedback && (
                  <p
                    className={`text-sm ${
                      contactStatus === "success" ? "text-green-600" : contactStatus === "error" ? "text-red-600" : "text-[#4a5568]"
                    }`}
                  >
                    {contactFeedback}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isContactSubmitting}
                  className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-6 py-3 rounded-full font-medium hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isContactSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-br from-[#0a0e27] to-[#1e1b4b] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto px-4">
            You're one step away from a clearer understanding of yourself. A thoughtful, personalised astrology report can help you make better decisions with confidence.
          </p>
          <Link
            href="/form/step1"
            className="inline-block bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-medium hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all shadow-lg hover:shadow-xl text-base md:text-lg"
          >
            Start My Reading →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#0a0e27] to-[#1e1b4b] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            <div>
              <h3 className="font-serif font-semibold text-xl md:text-2xl mb-3 md:mb-4">Taravani</h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">Personalised chart readings written by humans, for humans.</p>
            </div>
            <div>
              <h3 className="font-serif font-semibold text-lg md:text-xl mb-3 md:mb-4">Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm md:text-base text-gray-300 hover:text-[#d4af37] transition-colors">About</Link></li>
                <li><Link href="/privacy" className="text-sm md:text-base text-gray-300 hover:text-[#d4af37] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm md:text-base text-gray-300 hover:text-[#d4af37] transition-colors">Terms & Disclaimer</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif font-semibold text-lg md:text-xl mb-3 md:mb-4">Contact</h3>
              <p className="text-sm md:text-base text-gray-300">For inquiries, please use the contact form or email us directly.</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 md:pt-8 text-center text-xs md:text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Taravani. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-xl">
            <button
              onClick={handleDismissPopup}
              className="absolute top-4 right-4 text-[#4a5568] hover:text-[#0a0e27]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-serif font-bold text-[#0a0e27] mb-4">
              Wait! Discover What Makes You Unique
            </h2>
            
            <div className="bg-gradient-to-br from-[#f4e4bc] to-[#fafafa] border border-[#d4af37] rounded-lg p-4 mb-6">
              <p className="text-lg font-semibold text-[#0a0e27] mb-1">
                Get ₹100 off your first reading!
              </p>
              <p className="text-sm text-[#4a5568]">
                Use code: <span className="font-mono font-bold text-[#d4af37]">FIRST100</span>
              </p>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              />
              <button
                type="submit"
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-6 py-3 rounded-full font-medium hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all"
              >
                Claim My Discount
              </button>
            </form>
            
            <button
              onClick={handleDismissPopup}
              className="w-full mt-4 text-sm text-[#4a5568] hover:text-[#0a0e27]"
            >
              No thanks, I'll continue browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
