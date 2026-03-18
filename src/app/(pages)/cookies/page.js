export const metadata = {
  title: "Cookie Policy | Tech&",
  description:
    "Learn about how Tech& uses cookies on our website and SaaS platforms to improve functionality, performance, and user experience.",
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] text-white py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 md:px-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Cookie Policy
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl">
            Understanding how we use cookies to enhance your experience on our
            platforms.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 md:px-16">
          {/* What Are Cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Are Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Cookies are small text files stored on your device when you visit
              a website. They help improve functionality, performance, and user
              experience. This policy applies to Tech& FZCO's websites,
              client portals, and SaaS platforms.
            </p>
          </div>

          {/* Types of Cookies We Use */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Types of Cookies We Use
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Tech& FZCO may use:
            </p>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#5B6FB6]">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Strictly Necessary Cookies
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Required for authentication, security, and SaaS platform
                      functionality / website operation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#5B6FB6]">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Performance Cookies
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Measure platform and website performance and help analyze
                      website usage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#5B6FB6]">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Functionality Cookies
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Remember user preferences and settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#5B6FB6]">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Analytics Cookies
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Understand usage trends and collect aggregated, anonymized
                      usage data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#5B6FB6]">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Consent Cookies
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Store cookie consent preferences (EU/UK compliance).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How We Use Cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How We Use Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Cookies are used to:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                "Ensure website functionality",
                "Analyze traffic and usage patterns",
                "Improve content and user experience",
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-[#5B6FB6] mr-3 flex-shrink-0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Managing Cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Managing Cookies
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                You can manage or disable cookies through your browser settings.
                Please note that disabling cookies may affect website
                functionality.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-[#5B6FB6]">
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong>EU and UK Users:</strong> Will be presented with a
                cookie consent banner in compliance with GDPR and UK GDPR. You
                may manage or withdraw consent at any time through cookie
                settings or browser controls.
              </p>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Third-Party Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Some cookies may be placed by third-party services such as
              analytics or performance monitoring tools. These providers have
              their own privacy policies.
            </p>
          </div>

          {/* Updates to This Policy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Updates to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              We may update this Cookie Policy from time to time. Updates will
              be published on our website.
            </p>
          </div>

          {/* Browser Cookie Settings */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Browser Cookie Settings
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Learn how to manage cookies in popular browsers:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  name: "Google Chrome",
                  link: "https://support.google.com/chrome/answer/95647",
                },
                {
                  name: "Mozilla Firefox",
                  link: "https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer",
                },
                {
                  name: "Safari",
                  link: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac",
                },
                {
                  name: "Microsoft Edge",
                  link: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
                },
              ].map((browser, index) => (
                <a
                  key={index}
                  href={browser.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#5B6FB6] transition-all group"
                >
                  <span className="text-gray-700 font-medium group-hover:text-[#5B6FB6]">
                    {browser.name}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#5B6FB6]"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">
              Questions About Cookies?
            </h3>
            <p className="text-gray-100 mb-4 leading-relaxed">
              If you have any questions about our use of cookies or this Cookie
              Policy, please contact us.
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
