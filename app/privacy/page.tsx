import Link from "next/link";

export default function Privacy() {
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
        <h1 className="text-4xl font-serif font-bold text-[#1a1a2e] mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-8 space-y-6 text-[#4a4a5e]">
          <p className="text-sm text-[#8a8a9e]">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              When you request a birth chart reading, we collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your full name</li>
              <li>Your email address</li>
              <li>Your date of birth</li>
              <li>Your time of birth (exact or approximate)</li>
              <li>Your place of birth</li>
              <li>Your chosen focus area for the reading</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">How We Use Your Information</h2>
            <p className="leading-relaxed">
              We use your information solely to create and deliver your personalised birth chart reading. Your data is used by our astrologer to generate your report and to send it to your email address.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Data Storage and Retention</h2>
            <p className="leading-relaxed">
              Your personal information is stored securely in our database for a maximum of 30 days. This retention period allows us to resend your report if you request it. After 30 days, all your personal data is permanently deleted from our systems.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Data Sharing</h2>
            <p className="leading-relaxed">
              We do not share, sell, or rent your personal information to any third parties. Your data is only accessible to our astrologer for the purpose of creating your reading.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Your Rights</h2>
            <p className="leading-relaxed">
              You have the right to request access to your data, request deletion of your data before the 30-day period expires, or request a copy of your report to be resent. To exercise these rights, please contact us.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-semibold text-[#1a1a2e] mt-6 mb-4">Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through the contact form on our website.
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

