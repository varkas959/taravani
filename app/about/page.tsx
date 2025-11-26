import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="border-b border-[#e0e0e0] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-serif font-semibold text-[#1a1a2e]">
              Taravani
            </Link>
            <div className="flex gap-6">
              <Link href="/about" className="text-sm hover:text-[#d4af37] transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-sm hover:text-[#d4af37] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm hover:text-[#d4af37] transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-serif font-bold text-[#1a1a2e] mb-8">About Taravani</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-8 space-y-6 text-[#4a4a5e]">
          <p className="text-lg leading-relaxed">
            Taravani was founded on the principle that astrology should be personal, meaningful, and written by humans who understand the art and science of chart interpretation.
          </p>
          
          <p className="leading-relaxed">
            In an age of automation and AI-generated content, we believe that the most valuable astrological insights come from experienced practitioners who can synthesize the complex interplay of planetary positions, aspects, and houses into coherent, relevant guidance.
          </p>
          
          <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-8 mb-4">Our Approach</h2>
          <p className="leading-relaxed">
            Every birth chart reading we provide is personally written by our professional astrologer, who has over 15 years of experience in both traditional and modern astrological techniques. We don't use templates, AI, or automated interpretations.
          </p>
          
          <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-8 mb-4">Privacy & Data Protection</h2>
          <p className="leading-relaxed">
            We take your privacy seriously. Your personal information is stored securely and is automatically deleted after 30 days, unless you request otherwise. We never share your data with third parties.
          </p>
          
          <div className="mt-8 pt-8 border-t border-[#e0e0e0]">
            <Link
              href="/"
              className="text-[#d4af37] hover:text-[#1a1a2e] transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

