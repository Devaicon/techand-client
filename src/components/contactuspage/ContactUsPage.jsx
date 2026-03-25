"use client";
import { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Mail, MessageSquare, UserCircle } from "lucide-react";
import FinancialBacking from "../landing/financial/FinancialBacking";
import CallNowForm from "../landing/contact-form/CallNowForm";
import RequestCallBackForm from "../landing/contact-form/RequestCallBackForm";
import TalkToExpertForm from "../landing/contact-form/TalkToExpertForm";

const ContactUsPage = () => {
  const [activeTab, setActiveTab] = useState("callNow");

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] overflow-hidden">
        {/* Background Image */}
        <Image
          src="/contact-page-heroimg.webp"
          alt="Contact Tech&"
          fill
          priority
          className="
      object-cover
      brightness-[1.05]
      contrast-[1.15]
      saturate-[1.1]
    "
        />

        {/* Gradient Overlay (UNCHANGED) */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background:
              "linear-gradient(180deg, rgba(69, 85, 167, 1) 0%, rgba(83, 64, 107, 1) 100%) ",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Contact Tech&
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl">
            Let&apos;s discuss how we can help your business
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section
        className="py-6 sm:py-8 md:py-10"
        style={{
          background:
            "linear-gradient(0deg, rgba(235, 242, 250, 0.8) 2.06%, rgba(242, 240, 239, 0.8) 100%)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 ">
            {/* Left Side - Tabbed Form Section */}
            <div className="lg:w-[420px] xl:w-[680px]    ">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
                <div className="flex flex-col sm:flex-row h-full">
                  {/* Left Sidebar with Tabs */}
                  <div
                    className="w-full sm:w-[200px] lg:w-[220px] flex-shrink-0 shadow-md"
                    style={{
                      background: "#37469e",
                    }}
                  >
                    <div className="flex sm:flex-col p-5 ">
                      {/* Call Now Tab */}
                      <button
                        onClick={() => setActiveTab("callNow")}
                        className={`flex-1 sm:flex-none flex items-center gap-3 px-4 py-4 sm:py-5 text-left transition-all rounded-lg ${
                          activeTab === "callNow"
                            ? "bg-white/20 border-l-4 border-white"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <Phone className="w-9 h-9 p-[6px] rounded-lg bg-white/20 text-white " />
                        <span className="text-white text-sm font-semibold">
                          Call Now
                        </span>
                      </button>

                      {/* Request Call Back Tab */}
                      <button
                        onClick={() => setActiveTab("requestCallback")}
                        className={`flex-1 sm:flex-none flex items-center gap-3 px-4 py-4 sm:py-5 text-left transition-all rounded-lg ${
                          activeTab === "requestCallback"
                            ? "bg-white/20 border-l-4 border-white"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <MessageSquare className="w-9 h-9 p-[6px] rounded-lg bg-white/20 text-white " />
                        <span className="text-white text-sm font-semibold whitespace-nowrap">
                          Request Call Back
                        </span>
                      </button>

                      {/* Talk to Expert Tab */}
                      <button
                        onClick={() => setActiveTab("talkToExpert")}
                        className={`flex-1 sm:flex-none flex items-center gap-3 px-4 py-4 sm:py-5 text-left transition-all rounded-lg ${
                          activeTab === "talkToExpert"
                            ? "bg-white/20 border-l-4 border-white"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <UserCircle className="w-9 h-9 p-[6px] rounded-lg bg-white/20 text-white " />
                        <span className="text-white text-sm font-semibold whitespace-nowrap">
                          Talk to Expert
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Right Content Area */}
                  <div className="flex-1 p-6 sm:p-8">
                    {/* Call Now Content */}
                    {activeTab === "callNow" && (
                      <CallNowForm variant="contact-page" />
                    )}

                    {/* Request Call Back Content */}
                    {activeTab === "requestCallback" && (
                      <RequestCallBackForm variant="contact-page" />
                    )}

                    {/* Talk to Expert Content */}
                    {activeTab === "talkToExpert" && (
                      <TalkToExpertForm variant="contact-page" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Map and Visit Office */}
            <div className="flex-1 space-y-6">
              {/* Map Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative w-full h-80 sm:h-96 flex items-center justify-center">
                <Image
                  src="/mapfinal1.png"
                  alt="Office Location Maap"
                  fill
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Visit Our Office Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#333333] mb-6">
                  Visit our office
                </h2>
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#4a5383]/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#4a5383]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Address
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Office 704, 7th Floor, 5EA Building (East Wing)
                        <br />
                        Dubai Airport Freezone Authority – DAFZA
                        <br />
                        Dubai, United Arab Emirates
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#4a5383]/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-[#4a5383]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Phone
                      </h3>
                      <p className="text-sm text-gray-600">+971 50 702 0541</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#4a5383]/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#4a5383]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Email
                      </h3>
                      <p className="text-sm text-gray-600">
                        contact@techand.ai
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Backing Section */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 mt-6 sm:mt-8 md:mt-10">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl py-10 px-10">
            {/* Override FinancialBacking section styling */}
            <div className="[&_section]:!bg-white [&_section]:!min-h-0 [&_section]:!h-auto [&_section]:!py-0 [&_section]:!px-0 [&_section]:!gap-8 [&_section>div:first-child]:!w-full [&_section>div:first-child]:!max-w-full [&_section>div:first-child]:!mt-0 [&_section>div:first-child>p]:hidden [&_section>div:nth-child(2)]:!w-full [&_section>div:nth-child(2)]:!max-w-full [&_section>div:last-child]:!hidden">
              <FinancialBacking />
            </div>

            {/* Partner Logos */}
            {/* <div className="flex flex-wrap items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Image
                  src="/microsoftlogo.svg"
                  alt="Microsoft"
                  width={504}
                  height={204}
                  className="w-16 h-16 object-contain"
                />
                <div className="flex flex-col leading-none">
                  <span className="text-xs text-gray-700 font-semibold">
                    Microsoft
                  </span>
                  <span className="text-xs font-bold bg-gradient-to-r from-[#5E5E5E] to-[#7C5AC2] bg-clip-text text-transparent">
                    Partner
                  </span>
                </div>
              </div>
              <Image
                src="/salesforce.svg"
                alt="Salesforce Partner"
                width={204}
                height={204}
                className="h-26 w-auto object-contain"
              />
              <Image
                src="/openedx.svg"
                alt="Open edX Partner"
                width={204}
                height={204}
                className="h-21 w-auto object-contain"
              />
            </div> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactUsPage;
