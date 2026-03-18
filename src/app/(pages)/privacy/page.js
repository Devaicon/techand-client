export const metadata = {
  title: "Privacy Policy | Tech&",
  description:
    "Learn how Tech& collects, uses, and protects your personal data in compliance with UAE data protection laws and international privacy standards.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] text-white py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 md:px-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl">
            Your privacy matters to us. Learn how we protect and handle your
            personal information.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 md:px-16">
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Tech& is committed to protecting the privacy and personal
              data of its clients, partners, website visitors, and employees.
              This Privacy Policy explains how we collect, use, disclose, store,
              and protect personal data in compliance with applicable UAE data
              protection laws and internationally recognized privacy principles.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Information We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              We may collect the following categories of information:
            </p>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#5B6FB6]">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Personal Identification Information
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Name, email address, phone number, job title, company name.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#5B6FB6]">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Business Information
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Project requirements, contracts, invoices, and communications.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#5B6FB6]">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Technical Information
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  IP address, browser type, operating system, device
                  identifiers, and usage logs.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#5B6FB6]">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Recruitment Information
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  CVs, employment history, education, and professional details
                  (if you apply for a job).
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How We Use Information
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              We use collected information to:
            </p>
            <ul className="space-y-3">
              {[
                "Provide and manage our services",
                "Respond to inquiries and requests",
                "Improve website performance and user experience",
                "Manage contractual and legal obligations",
                "Conduct recruitment and internal operations",
                "Ensure security and prevent fraud",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-[#5B6FB6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* International Data Transfers & Sharing */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              International Data Transfers & Sharing
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              We do not sell personal data. We may share data with:
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Trusted service providers and partners under confidentiality agreements",
                "Legal or regulatory authorities when required by law",
                "Professional advisers (legal, financial, or auditors)",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-[#5B6FB6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 text-lg">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 leading-relaxed text-lg">
              Where personal data is transferred outside the UAE, we ensure
              appropriate safeguards are in place to protect data in accordance
              with applicable laws and industry standards.
            </p>
          </div>

          {/* Data Retention */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              We retain personal data only for as long as necessary to fulfill
              the purposes outlined in this policy, unless a longer retention
              period is required or permitted by law.
            </p>
          </div>

          {/* Data Subject Rights */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Data Subject Rights
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Depending on applicable law, you may have the right to:
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Access your personal data",
                "Request correction or deletion",
                "Object to or restrict processing",
                "Withdraw consent",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-[#5B6FB6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 text-lg">{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-[#5B6FB6]">
              <p className="text-gray-700 leading-relaxed text-lg mb-3">
                <strong>EU/UK Residents:</strong> Additionally have the right to
                data portability and to lodge a complaint with a supervisory
                authority.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong>Contact:</strong> Requests may be sent to:{" "}
                <a
                  href="mailto:privacy@vitaventure.com"
                  className="text-[#5B6FB6] hover:underline font-medium"
                >
                  privacy@vitaventure.com
                </a>
              </p>
            </div>
          </div>

          {/* Security of Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Security of Information
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              We implement appropriate technical and organizational measures to
              safeguard personal data against unauthorized access, loss, misuse,
              or alteration.
            </p>
          </div>

          {/* Policy Updates */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Policy Updates
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              We may update this Privacy Policy periodically. Changes will be
              posted on our website.
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Questions?</h3>
            <p className="text-gray-100 mb-4 leading-relaxed">
              If you have any questions or concerns about our Privacy Policy,
              please contact us.
            </p>
            <a
              href="mailto:privacy@vitaventure.com"
              className="inline-block bg-white text-[#5B6FB6] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
