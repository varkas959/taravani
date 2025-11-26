import Link from "next/link";

export default function Terms() {
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
        <h1 className="text-4xl font-serif font-bold text-[#1a1a2e] mb-8">Terms & Disclaimer</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-8 space-y-6 text-[#4a4a5e]">
          <p className="text-sm text-[#8a8a9e]">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Terms of Service</h2>
            <p className="leading-relaxed mb-4">
              By using Taravani's services, you agree to the following terms:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You provide accurate and truthful birth information to the best of your knowledge</li>
              <li>You understand that reports are delivered within 24 hours of submission</li>
              <li>You consent to the storage of your data for 30 days as outlined in our Privacy Policy</li>
              <li>You are at least 18 years old or have parental consent to use this service</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Disclaimer</h2>
            <p className="leading-relaxed mb-4">
              <strong className="text-[#1a1a2e]">Astrological readings are for entertainment and personal reflection purposes only.</strong> They should not be used as a substitute for professional advice in areas such as:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Medical diagnosis or treatment</li>
              <li>Financial or legal advice</li>
              <li>Mental health counseling</li>
              <li>Major life decisions</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Taravani and its astrologers are not responsible for any decisions made based on the information provided in birth chart readings. The interpretations offered are based on astrological principles and should be considered as one perspective among many.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Service Guarantee</h2>
            <p className="leading-relaxed">
              We guarantee that your report will be delivered within 24 hours of submission. If you do not receive your report within this timeframe, please contact us and we will investigate and provide a resolution.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Refund Policy</h2>
            <p className="leading-relaxed">
              As our service is provided free of charge, no refunds apply. However, if you are not satisfied with your reading or experience any issues, please contact us and we will work to address your concerns.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Limitation of Liability</h2>
            <p className="leading-relaxed">
              Taravani shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services or the information provided in birth chart readings.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of our services constitutes acceptance of any modified terms.
            </p>
          </section>
          
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

