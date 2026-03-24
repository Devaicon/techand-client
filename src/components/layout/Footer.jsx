"use client";

import Image from "next/image";
import Link from "next/link";
import { Linkedin, Mail, Phone, MapPin } from "lucide-react";

const FOOTER_SECTIONS = [
  {
    title: "Industries",
    links: [
      {
        label: "Banking & Financial Services",
        href: "/industries#bfsi",
      },
      { label: "Public Sector", href: "/industries#public-sector" },
      {
        label: "Tourism & Hospitality",
        href: "/industries#hospitality",
      },
      {
        label: "Trading & Manufacturing",
        href: "/industries#manufacturing",
      },
      { label: "Retail", href: "/industries#retail" },
      {
        label: "Professional Services",
        href: "/industries#professional-services",
      },
      { label: "Non Profit", href: "/industries#nonprofit" },
    ],
  },
  {
    title: "Capabilities",
    links: [
      { label: "Capabilities Overview", href: "/capabilities" },
      { label: "AI", href: "/capabilities#ai" },
      {
        label: "Business Applications",
        href: "/capabilities/business-applications",
      },
      { label: "Cloud Services", href: "/capabilities/cloud-services" },
      { label: "Data", href: "/capabilities/data" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why Tech&", href: "/whywithtech&" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Insights", href: "/insights" },
      { label: "What We Do", href: "/whatwedo" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Security Policy", href: "/security" },
      { label: "Cookies Policy", href: "/cookies" },
    ],
  },
];

const OFFICE_INFO = {
  city: "Dubai",
  phone: "+971 50 702 0541",
  address:
    "Office 704, 7th Floor, 5EA Building (East Wing), Dubai Airport Freezone Authority – DAFZA, Dubai, UAE",
};

export default function Footer() {
  return (
    <footer
      className="bg-[#0F172A] text-white py-12 md:py-16"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16">
        {/* Top Section - Logo and Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="relative w-42 h-32 mt-8 lg:mt-8 ">
                <Image
                  src="/footer_logo.svg"
                  alt="Tech& Logo"
                  fill
                  className="object-contain "
                />
              </div>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Value-driven innovation through automation and technology
              consulting for the UAE & GCC region.
            </p>
          </div>

          {/* Navigation Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <nav
              key={section.title}
              className="flex flex-col mt-8 lg:mt-8"
              aria-label={section.title}
            >
              <h4 className="text-white font-semibold mb-4 text-sm">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Office Section */}
        <div
          className="
           pt-8 mb-8"
          style={{
            backgroundImage: "url('/contact-page-map.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
            height: "auto",
          }}
        >
          <h3 className="text-lg font-semibold mb-6">Our Office</h3>

          {/* Office Location */}
          <div className="relative rounded-lg overflow-hidden p-6 md:p-8">
            <div className="max-w-md space-y-3">
              <h4 className="font-semibold text-white text-base">
                {OFFICE_INFO.city}
              </h4>
              <div className="flex items-start gap-2 text-sm text-gray-200">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{OFFICE_INFO.address}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-200">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href={`tel:${OFFICE_INFO.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {OFFICE_INFO.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Contact and Social */}
        <div className=" pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <a
              href="mailto:Contact@techand.ai"
              className="text-sm hover:text-gray-300 transition-colors"
            >
              Contact@techand.ai
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="https://www.linkedin.com/company/techand.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-6 ">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Tech& Consulting. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
