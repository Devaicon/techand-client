export const metadata = {
  title: "Security Policy | Tech&",
  description:
    "Learn about Tech&'s comprehensive security measures, aligned with ISO/IEC 27001 and SOC 2, protecting our SaaS platforms and client data.",
};

export default function SecurityPolicyPage() {
  return (
    <main className="   min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] text-white py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 md:px-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Security Policy
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-3xl">
            Our commitment to protecting your information with enterprise-grade
            security measures.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 md:px-16">
          {/* Purpose & Scope */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Purpose & Scope
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              This Information Security Policy outlines Tech&'s
              commitment to protecting information assets belonging to the
              company, its clients, and partners. It supports our SaaS platforms
              and managed services environments, including cloud-hosted systems.
            </p>
            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-[#5B6FB6]">
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong>Scope:</strong> Applies to all employees, contractors,
                and third-party service providers, as well as all information
                systems, networks, applications, and data.
              </p>
            </div>
          </div>

          {/* Security Principles */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Security Principles
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Tech& follows these core security principles:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Confidentiality
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Information is accessible only to authorized individuals.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Integrity
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Information is accurate and protected from unauthorized
                  modification.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Availability
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Information is accessible when required for business
                  operations.
                </p>
              </div>
            </div>
          </div>

          {/* Security Controls */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Security Controls
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              We maintain enterprise-grade security controls aligned with
              ISO/IEC 27001, SOC 2, and cloud security best practices,
              including:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Role-based access control (RBAC)",
                "Multi-factor authentication (MFA)",
                "Encryption of data at rest and in transit",
                "Secure software development lifecycle (SSDLC)",
                "Code reviews and penetration testing",
                "Continuous monitoring and logging",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <svg
                    className="w-6 h-6 text-[#5B6FB6] mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-lg">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Management */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Incident Management
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Security incidents are managed through a comprehensive process:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  step: "1",
                  title: "Identified",
                  desc: "Detect and log incidents",
                },
                { step: "2", title: "Reported", desc: "Notify relevant teams" },
                {
                  step: "3",
                  title: "Assessed",
                  desc: "Evaluate impact and severity",
                },
                {
                  step: "4",
                  title: "Responded",
                  desc: "Take immediate action",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#5B6FB6]"
                >
                  <div className="flex items-center mb-3">
                    <span className="w-10 h-10 bg-[#5B6FB6] text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {item.step}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed text-lg mt-6">
              Corrective actions are implemented to prevent recurrence.
            </p>
          </div>

          {/* Employee & Third-Party Responsibilities */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Employee & Third-Party Responsibilities
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#5B6FB6]">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Employees
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All personnel are required to:
                </p>
                <ul className="space-y-2">
                  {[
                    "Follow company security policies",
                    "Protect credentials and confidential information",
                    "Report suspected security incidents immediately",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-[#5B6FB6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#5B6FB6]">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Third Parties
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Third parties with access to Tech& information systems
                  must comply with equivalent security standards and contractual
                  obligations.
                </p>
              </div>
            </div>
          </div>

          {/* Policy Review */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Policy Review
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              This policy is reviewed periodically and updated to address
              emerging risks and regulatory requirements.
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-[#5B6FB6] to-[#4a5e9d] text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Security Concerns?</h3>
            <p className="text-gray-100 mb-4 leading-relaxed">
              If you have any security concerns or wish to report a potential
              security incident, please contact us immediately.
            </p>
            <a
              href="mailto:security@vitaventure.com"
              className="inline-block bg-white text-[#5B6FB6] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Report Security Issue
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
