"use client";

const ContactFormContainer = ({ children, activeTab, setActiveTab }) => {
  return (
    <section className="pt-8 sm:pt-12 pb-12 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full px-4 md:px-8 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Contact Card */}
          <div className="p-6 sm:p-8 lg:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold mb-3 sm:mb-4 text-black">
              Have Questions?
              <span className="text-[rgba(55,70,158,1)]">
                {" "}
                Let&apos;s Talk.
              </span>
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base">
              We have got the answers to your questions.
            </p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-4 border-b border-gray-200 mb-4 sm:mb-6 md:mb-8">
              <button
                onClick={() => setActiveTab("callNow")}
                className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium transition-colors text-xs sm:text-sm md:text-base ${
                  activeTab === "callNow"
                    ? "text-[#281333] border-b-2 border-[#281333]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Call Now
              </button>
              <button
                onClick={() => setActiveTab("requestCallback")}
                className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium transition-colors text-xs sm:text-sm md:text-base ${
                  activeTab === "requestCallback"
                    ? "text-[#281333] border-b-2 border-[#281333]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Request Call Back
              </button>
              <button
                onClick={() => setActiveTab("talkToExpert")}
                className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium transition-colors text-xs sm:text-sm md:text-base ${
                  activeTab === "talkToExpert"
                    ? "text-[#281333] border-b-2 border-[#281333]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Talk to Expert
              </button>
            </div>

            {/* Tab Content */}
            {children}
          </div>

          {/* Right Side - Illustration */}
          <div className="hidden lg:flex items-center justify-center order-2">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/contact-section.webp"
                  alt="Contact"
                  className="w-full h-full object-cover block"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormContainer;
