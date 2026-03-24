"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CircleArrowRight,
  ChevronDown,
  Home,
  Building2,
  Clock,
  Layers,
  Scale,
  Store,
  MapPin,
  Monitor,
  Briefcase,
  DollarSign,
  Heart,
  ShoppingCart,
  Factory,
  TrendingUp,
  Cloud,
  Brain,
  Info,
  Phone,
  ChevronRight,
} from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showIndustriesDropdown, setShowIndustriesDropdown] = useState(false);
  const [showCapabilitiesDropdown, setShowCapabilitiesDropdown] =
    useState(false);
  const [showWhyVitaDropdown, setShowWhyVitaDropdown] = useState(false);
  const [hoveredIndustry, setHoveredIndustry] = useState(
    "Banking & Financial Services",
  );
  const [hoveredCapability, setHoveredCapability] = useState("AI");

  const industriesTimeoutRef = useRef(null);
  const capabilitiesTimeoutRef = useRef(null);
  const whyVitaTimeoutRef = useRef(null);

  // Mobile dropdown states
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = useState(false);
  const [mobileCapabilitiesOpen, setMobileCapabilitiesOpen] = useState(false);
  const [mobileWhyVitaOpen, setMobileWhyVitaOpen] = useState(false);
  const [mobileExpandedIndustry, setMobileExpandedIndustry] = useState(null);
  const [mobileExpandedCapability, setMobileExpandedCapability] =
    useState(null);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeMobileMenu();
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  const handleIndustriesEnter = () => {
    if (industriesTimeoutRef.current) {
      clearTimeout(industriesTimeoutRef.current);
    }
    setShowIndustriesDropdown(true);
  };

  const handleIndustriesLeave = () => {
    industriesTimeoutRef.current = setTimeout(() => {
      setShowIndustriesDropdown(false);
    }, 150);
  };

  const handleCapabilitiesEnter = () => {
    if (capabilitiesTimeoutRef.current) {
      clearTimeout(capabilitiesTimeoutRef.current);
    }
    setShowCapabilitiesDropdown(true);
  };

  const handleCapabilitiesLeave = () => {
    capabilitiesTimeoutRef.current = setTimeout(() => {
      setShowCapabilitiesDropdown(false);
    }, 150);
  };

  const handleWhyVitaEnter = () => {
    if (whyVitaTimeoutRef.current) {
      clearTimeout(whyVitaTimeoutRef.current);
    }
    setShowWhyVitaDropdown(true);
  };

  const handleWhyVitaLeave = () => {
    whyVitaTimeoutRef.current = setTimeout(() => {
      setShowWhyVitaDropdown(false);
    }, 150);
  };

  const capabilitiesData = [
    {
      name: "AI",
      icon: <Brain className="w-5 h-5" />,
      description:
        "Advanced AI and automation solutions that enable intelligent workflows, predictive analytics, and transformative business outcomes across enterprise systems.",
      items: [
        {
          name: "Microsoft Copilot for Microsoft 365",
          icon: "/icons/microsoft-copilot.svg",
          id: "microsoft-copilot-m365",
        },
        {
          name: "Dynamics 365 Copilot",
          icon: "/icons/Dynamics365_scalable.svg",
          id: "dynamics-365-copilot",
        },
        {
          name: "Azure OpenAI Service",
          icon: "/icons/azure/03438-icon-service-Azure-OpenAI.svg",
          id: "azure-openai-service",
        },
        {
          name: "Copilot Studio",
          icon: "/icons/CopilotStudio_scalable.svg",
          id: "copilot-studio",
        },
        {
          name: "AI Builder",
          icon: "/icons/AIBuilder_scalable.svg",
          id: "ai-builder",
        },
        {
          name: "Azure AI Services",
          icon: "/icons/azure/10162-icon-service-Cognitive-Services.svg",
          id: "azure-ai-services",
        },
        {
          name: "Intelligent Document Processing",
          icon: "/icons/azure/00819-icon-service-Form-Recognizers.svg",
          id: "intelligent-document-processing",
        },
        {
          name: "Predictive Models",
          icon: "/icons/azure/10166-icon-service-Machine-Learning.svg",
          id: "predictive-models",
        },
      ],
    },
    {
      name: "Business Applications",
      icon: <Briefcase className="w-5 h-5" />,
      description:
        "Comprehensive Dynamics 365 solutions for finance, sales, customer service, supply chain, and operations that drive efficiency and business growth.",
      items: [
        {
          name: "Dynamics 365 Finance",
          icon: "/icons/Finance_scalable.svg",
          id: "dynamics-365-finance",
        },
        {
          name: "Dynamics 365 Supply Chain Management",
          icon: "/icons/SupplyChainManagement_scalable.svg",
          id: "dynamics-365-supply-chain",
        },
        {
          name: "Dynamics 365 Sales",
          icon: "/icons/Sales_scalable.svg",
          id: "dynamics-365-sales",
        },
        {
          name: "Dynamics 365 Customer Service",
          icon: "/icons/CustomerServices_scalable.svg",
          id: "dynamics-365-customer-service",
        },
        {
          name: "Dynamics 365 Field Service",
          icon: "/icons/FieldService_scalable.svg",
          id: "dynamics-365-field-service",
        },
        {
          name: "Dynamics 365 Project Operations",
          icon: "/icons/ProjectOperations_scalable.svg",
          id: "dynamics-365-project-operations",
        },
        {
          name: "Dynamics 365 Human Resources",
          icon: "/icons/HumanResources_scalable.svg",
          id: "dynamics-365-human-resources",
        },
        {
          name: "Dynamics 365 Commerce",
          icon: "/icons/Commerce_scalable.svg",
          id: "dynamics-365-commerce",
        },
        {
          name: "Dynamics 365 Business Central",
          icon: "/icons/BusinessCentral_scalable.svg",
          id: "dynamics-365-business-central",
        },
      ],
    },
    {
      name: "Cloud Services",
      icon: <Cloud className="w-5 h-5" />,
      description:
        "Scalable Azure cloud infrastructure, integration services, and modern application platforms that provide security, flexibility, and reliability.",
      items: [
        {
          name: "Microsoft Azure Infrastructure",
          icon: "/icons/azure/10018-icon-service-Azure-A.svg",
          id: "microsoft-azure-infrastructure",
        },
        {
          name: "Azure App Services & Web Apps",
          icon: "/icons/azure/10035-icon-service-App-Services.svg",
          id: "azure-app-services",
        },
        {
          name: "Azure Kubernetes Service",
          icon: "/icons/kubernetes.svg",
          id: "azure-kubernetes-service",
        },
        {
          name: "Azure Virtual Desktop",
          icon: "/icons/azure/00327-icon-service-Azure-Virtual-Desktop.svg",
          id: "azure-virtual-desktop",
        },
        {
          name: "Azure Integration Services",
          icon: "/icons/PowerAutomate_scalable.svg",
          id: "azure-integration-services",
        },
        {
          name: "Azure Security & Identity",
          icon: "/icons/azure/00321-icon-service-Security.svg",
          id: "azure-security-identity",
        },
        {
          name: "Azure DevOps & CI/CD Pipelines",
          icon: "/icons/azure/10261-icon-service-Azure-DevOps.svg",
          id: "azure-devops-cicd",
        },
        {
          name: "Cloud Migration & Modernization",
          icon: "/icons/azure/10281-icon-service-Azure-Migrate.svg",
          id: "cloud-migration-modernization",
        },
      ],
    },
    {
      name: "Data",
      icon: <TrendingUp className="w-5 h-5" />,
      description:
        "Modern data platforms, analytics, and governance solutions that transform enterprise data into actionable insights and strategic business intelligence.",
      items: [
        {
          name: "Microsoft Fabric",
          icon: "/icons/PowerPlatform_scalable.svg",
          id: "microsoft-fabric",
        },
        {
          name: "Azure Data Factory",
          icon: "/icons/azure/10126-icon-service-Data-Factories.svg",
          id: "azure-data-factory",
        },
        {
          name: "Azure Synapse Analytics",
          icon: "/icons/azure/00606-icon-service-Azure-Synapse-Analytics.svg",
          id: "azure-synapse-analytics",
        },
        {
          name: "Power BI",
          icon: "/icons/azure/03332-icon-service-Power-BI-Embedded.svg",
          id: "power-bi",
        },
        {
          name: "OneLake",
          icon: "/icons/Dataverse_scalable.svg",
          id: "onelake",
        },
        {
          name: "Azure SQL & Managed Databases",
          icon: "/icons/azure/10130-icon-service-SQL-Database.svg",
          id: "azure-sql-managed-db",
        },
        {
          name: "Real-Time Analytics",
          icon: "/icons/azure/10145-icon-service-Azure-Data-Explorer-Clusters.svg",
          id: "real-time-analytics",
        },
        {
          name: "Data Governance & Security",
          icon: "/icons/azure/00011-icon-service-Compliance.svg",
          id: "data-governance-security",
        },
      ],
    },
  ];

  const industriesData = [
    {
      name: "Banking & Financial Services",
      id: "bfsi",
      icon: <DollarSign className="w-5 h-5" />,
      description:
        "Tech& serves banks and financial institutions across the UAE and GCC with secure and compliant digital platforms. Financial organizations manage complex operations every day. These include finance control, customer data, risk management, and regulatory reporting.",
    },
    {
      name: "Public Sector",
      id: "public-sector",
      icon: <Building2 className="w-5 h-5" />,
      description:
        "Tech& helps public sector organizations modernize services and improve governance. Government entities manage large volumes of data, finance, and citizen services. Tech& delivers digital platforms that support transparency, efficiency, and accountability.",
    },
    {
      name: "Tourism & Hospitality",
      id: "hospitality",
      icon: <MapPin className="w-5 h-5" />,
      description:
        "Tech& supports hotels, resorts, and travel businesses with connected digital systems. The hospitality industry faces high service expectations and operational pressure. Tech& helps manage bookings, guest engagement, finance, and daily operations.",
    },
    {
      name: "Trading & Manufacturing",
      id: "manufacturing",
      icon: <Factory className="w-5 h-5" />,
      description:
        "Tech& helps trading and manufacturing companies manage supply chains and production systems. These businesses require accuracy, speed, and visibility. Tech& connects inventory, production, logistics, and finance into a single digital view.",
    },
    {
      name: "Retail",
      id: "retail",
      icon: <Store className="w-5 h-5" />,
      description:
        "Tech& supports retailers in managing sales, inventory, and customer engagement. Retail businesses operate across physical and digital channels. Tech& connects these channels through unified commerce platforms.",
    },
    {
      name: "Professional Services",
      id: "professional-services",
      icon: <Briefcase className="w-5 h-5" />,
      description:
        "Tech& supports professional service firms with structured digital platforms. These firms manage projects, clients, billing, and compliance. Tech& helps simplify operations while improving service delivery and transparency.",
    },
    {
      name: "Non Profit",
      id: "nonprofit",
      icon: <Heart className="w-5 h-5" />,
      description:
        "Tech& helps non-profit organizations manage funding, programs, and reporting. These organizations need transparency and accountability. Tech& delivers platforms that support impact tracking and compliance while keeping operations efficient.",
    },
  ];

  const solutionsCategories = [
    {
      name: "Architecture & Engineering",
      icon: <Home className="w-5 h-5" />,
    },
    { name: "Government", icon: <Building2 className="w-5 h-5" /> },
    { name: "Rental", icon: <Clock className="w-5 h-5" /> },
    { name: "Construction", icon: <Layers className="w-5 h-5" /> },
    { name: "Legal", icon: <Scale className="w-5 h-5" /> },
    { name: "Retail", icon: <Store className="w-5 h-5" /> },
    {
      name: "Consulting",
      icon: <MapPin className="w-5 h-5" />,
      highlighted: true,
    },
    { name: "Manufacturing", icon: <Monitor className="w-5 h-5" /> },
    { name: "Service", icon: <Briefcase className="w-5 h-5" /> },
    { name: "Financial Services", icon: <DollarSign className="w-5 h-5" /> },
    { name: "Non-Profit", icon: <Heart className="w-5 h-5" /> },
    { name: "Wholesale", icon: <ShoppingCart className="w-5 h-5" /> },
  ];

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-center">
        <nav
          className={`bg-white mx-auto w-full lg:w-[calc(100%-280px)] max-w-[1639px] h-[80px] lg:h-[93px] px-4 sm:px-8 lg:px-6 xl:px-[59px] py-4 lg:py-[32px] rounded-none transition-all duration-200 ${
            showIndustriesDropdown ||
            showCapabilitiesDropdown ||
            showWhyVitaDropdown
              ? " border-b-0"
              : "lg:rounded-b-[30px]"
          }`}
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center"
              aria-label="Tech& - Go to homepage"
            >
              <Image
                src="/logo.svg"
                alt="Tech& Logo"
                width={124}
                height={51}
                priority
                className="object-contain w-[90px] h-auto lg:w-[124px]"
              />
            </Link>

            {/* Desktop Navigation */}
            <ul
              className="hidden lg:flex items-center gap-5 xl:gap-8"
              role="list"
            >
              {/* Industries Dropdown */}
              <li
                className="relative"
                onMouseEnter={handleIndustriesEnter}
                onMouseLeave={handleIndustriesLeave}
              >
                <Link
                  href="/industries"
                  className="text-gray-700 hover:text-[#5B6FB6] transition-colors font-bold text-sm relative whitespace-nowrap flex items-center gap-1"
                >
                  Industries
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      showIndustriesDropdown ? "rotate-180" : ""
                    }`}
                  />
                </Link>
              </li>

              {/* Capabilities Dropdown */}
              <li
                className="relative"
                onMouseEnter={handleCapabilitiesEnter}
                onMouseLeave={handleCapabilitiesLeave}
              >
                <Link
                  href="/capabilities"
                  className="text-gray-700 hover:text-[#5B6FB6] transition-colors font-bold text-sm relative whitespace-nowrap flex items-center gap-1"
                >
                  Capabilities
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      showCapabilitiesDropdown ? "rotate-180" : ""
                    }`}
                  />
                </Link>
              </li>

              {/* Insights Link */}
              <li>
                <Link
                  href="/insights"
                  className="text-gray-700 hover:text-[#5B6FB6] transition-colors font-bold text-sm relative whitespace-nowrap"
                >
                  Insights
                </Link>
              </li>

              {/* What We Do Link */}
              <li>
                <Link
                  href="/whatwedo"
                  className="text-gray-700 hover:text-[#5B6FB6] transition-colors font-bold text-sm relative whitespace-nowrap"
                >
                  What We Do
                </Link>
              </li>

              {/* Why Tech& Dropdown */}
              <li
                className="relative"
                onMouseEnter={handleWhyVitaEnter}
                onMouseLeave={handleWhyVitaLeave}
              >
                <Link
                  href="/whywith-techand"
                  className="text-gray-700 hover:text-[#5B6FB6] transition-colors font-bold text-sm relative whitespace-nowrap flex items-center gap-1"
                >
                  Why Tech&
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      showWhyVitaDropdown ? "rotate-180" : ""
                    }`}
                  />
                </Link>
              </li>
            </ul>

            {/* Desktop CTA */}
            <Link
              href="/contact-us"
              className="hidden lg:flex items-center gap-2 border-gray-300 text-gray-700 hover:border-[#5B6FB6] hover:text-[#5B6FB6] transition-all duration-200 font-medium text-sm group"
              aria-label="Get started Tech&"
            >
              <span>Get Started</span>
              <CircleArrowRight size={28} />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Industries Dropdown */}
      {showIndustriesDropdown && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[93px] w-full lg:w-[calc(100%-280px)] max-w-[1639px] z-40 animate-slideDown flex justify-center"
          onMouseEnter={handleIndustriesEnter}
          onMouseLeave={handleIndustriesLeave}
        >
          <div className="bg-white shadow-2xl rounded-b-[30px] border-b-2 border-gray-200 overflow-hidden w-full flex">
            {/* Left Section - Industry List */}
            <div className="w-1/3 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
              <div className="space-y-2">
                {industriesData.map((industry, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredIndustry(industry.name)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      hoveredIndustry === industry.name
                        ? "bg-white shadow-lg scale-[1.02] border-l-4 border-[#5B6FB6]"
                        : "hover:bg-white/60 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-[#5B6FB6]">{industry.icon}</div>
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {industry.name}
                    </span>
                    {hoveredIndustry === industry.name && (
                      <ChevronRight className="w-4 h-4 text-[#5B6FB6]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Industry Details */}
            <div className="w-2/3 p-8">
              {industriesData.map(
                (industry) =>
                  hoveredIndustry === industry.name && (
                    <div key={industry.name}>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        {industry.name}
                      </h3>
                      <p className="text-gray-700 text-base leading-relaxed mb-8">
                        {industry.description}
                      </p>

                      <Link
                        href={`/industries#${industry.id}`}
                        className="bg-transparent border-2 border-[#5B6FB6] text-[#5B6FB6] px-6 py-2.5 rounded-md font-semibold hover:bg-[#5B6FB6] hover:text-white transition-all duration-200 flex items-center gap-2 w-fit"
                      >
                        LEARN MORE
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Capabilities Dropdown */}
      {showCapabilitiesDropdown && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[93px] w-full lg:w-[calc(100%-280px)] max-w-[1639px] z-40 animate-slideDown flex justify-center"
          onMouseEnter={handleCapabilitiesEnter}
          onMouseLeave={handleCapabilitiesLeave}
        >
          <div className="bg-white shadow-2xl rounded-b-[30px] border-x-2 border-b-2 border-gray-200 overflow-hidden w-full flex">
            {/* Left Section - Capabilities List */}
            <div className="w-1/3 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
              <div className="space-y-2">
                {capabilitiesData.map((capability, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredCapability(capability.name)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      hoveredCapability === capability.name
                        ? "bg-white shadow-lg scale-[1.02] border-l-4 border-[#5B6FB6]"
                        : "hover:bg-white/60 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-[#5B6FB6]">{capability.icon}</div>
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {capability.name}
                    </span>
                    {hoveredCapability === capability.name && (
                      <ChevronRight className="w-4 h-4 text-[#5B6FB6]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Capability Details */}
            <div className="w-2/3 p-8">
              {capabilitiesData.map(
                (capability) =>
                  hoveredCapability === capability.name && (
                    <div key={capability.name}>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        {capability.name}
                      </h3>
                      <p className="text-gray-700 text-base leading-relaxed mb-6">
                        {capability.description}
                      </p>

                      {/* Items */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {capability.items.map((item, idx) => {
                          const hasIconPath = typeof item.icon === "string";
                          const ItemWrapper = hasIconPath ? Link : "div";

                          // Determine the correct page route based on capability category
                          let pageRoute = "/capabilities";
                          if (capability.name === "Business Applications") {
                            pageRoute = "/capabilities/business-applications";
                          } else if (capability.name === "Cloud Services") {
                            pageRoute = "/capabilities/cloud-services";
                          } else if (capability.name === "Data") {
                            pageRoute = "/capabilities/data";
                          }

                          const handleClick = (e) => {
                            if (item.id) {
                              // Add a small delay to allow page navigation to complete
                              setTimeout(() => {
                                const element = document.getElementById(
                                  item.id,
                                );
                                if (element) {
                                  element.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }, 100);
                            }
                          };

                          const itemProps = hasIconPath
                            ? {
                                href: item.id ? `${pageRoute}#${item.id}` : "#",
                                className:
                                  "flex items-center gap-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 p-2 rounded-lg transition-all duration-200 cursor-pointer",
                                onClick: handleClick,
                              }
                            : { className: "flex items-center gap-2" };

                          return (
                            <ItemWrapper key={idx} {...itemProps}>
                              {typeof item.icon === "string" ? (
                                <div className="relative w-6 h-6 flex-shrink-0">
                                  <Image
                                    src={item.icon}
                                    alt={item.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="text-[#5B6FB6]">
                                  {item.icon}
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {item.name}
                              </span>
                            </ItemWrapper>
                          );
                        })}
                      </div>

                      <Link
                        href={
                          capability.name === "AI"
                            ? "/capabilities"
                            : capability.name === "Business Applications"
                              ? "/capabilities/business-applications"
                              : capability.name === "Cloud Services"
                                ? "/capabilities/cloud-services"
                                : capability.name === "Data"
                                  ? "/capabilities/data"
                                  : "/capabilities"
                        }
                      >
                        <button
                          className="bg-transparent border-2 border-[#5B6FB6] text-[#5B6FB6] px-6 py-2.5 rounded-md font-semibold hover:bg-[#5B6FB6] hover:text-white transition-all duration-200 flex items-center gap-2"
                          type="button"
                        >
                          LEARN MORE
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Why Tech& Dropdown */}
      {showWhyVitaDropdown && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[93px] w-full lg:w-[calc(100%-280px)] max-w-[1639px] z-40 animate-slideDown flex items-center"
          onMouseEnter={handleWhyVitaEnter}
          onMouseLeave={handleWhyVitaLeave}
        >
          <div className="bg-white shadow-2xl rounded-b-[30px] border-x-2 border-b-2 border-gray-200 overflow-hidden w-full p-8 px-64">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <Link
                href="/whywith-techand"
                className="flex flex-col items-center text-center gap-4 p-6 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all duration-300 group hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-[#5B6FB6]"
              >
                <div className="text-[#5B6FB6] group-hover:scale-110 transition-transform duration-300 p-3 rounded-full group-hover:bg-[#5B6FB6] group-hover:text-white group-hover:shadow-lg">
                  <Info className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">
                    About Tech&
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Learn about our mission and values
                  </p>
                </div>
              </Link>

              <Link
                href="/contact-us"
                className="flex flex-col items-center text-center gap-4 p-6 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all duration-300 group hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-[#5B6FB6]"
              >
                <div className="text-[#5B6FB6] group-hover:scale-110 transition-transform duration-300 p-3 rounded-full group-hover:bg-[#5B6FB6] group-hover:text-white group-hover:shadow-lg">
                  <Phone className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">
                    Contact
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Get in touch with our team
                  </p>
                </div>
              </Link>

              {/* <Link
                href="/newsroom"
                className="flex flex-col items-center text-center gap-4 p-6 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all duration-300 group hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-[#5B6FB6]"
              >
                <div className="text-[#5B6FB6] group-hover:scale-110 transition-transform duration-300 p-3 rounded-full group-hover:bg-[#5B6FB6] group-hover:text-white group-hover:shadow-lg">
                  <Newspaper className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">
                    Newsroom
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Latest news and updates
                  </p>
                </div>
              </Link>

              <Link
                href="/analysts"
                className="flex flex-col items-center text-center gap-4 p-6 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all duration-300 group hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-[#5B6FB6]"
              >
                <div className="text-[#5B6FB6] group-hover:scale-110 transition-transform duration-300 p-3 rounded-full group-hover:bg-[#5B6FB6] group-hover:text-white group-hover:shadow-lg">
                  <Search className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">
                    Analysts & Tech&
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Industry insights and analysis
                  </p>
                </div>
              </Link>

              <Link
                href="/esg"
                className="flex flex-col items-center text-center gap-4 p-6 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all duration-300 group hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-[#5B6FB6]"
              >
                <div className="text-[#5B6FB6] group-hover:scale-110 transition-transform duration-300 p-3 rounded-full group-hover:bg-[#5B6FB6] group-hover:text-white group-hover:shadow-lg">
                  <Leaf className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">
                    ESG & CSR
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Sustainability and responsibility
                  </p>
                </div>
              </Link> */}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[70] lg:hidden shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <Link
                  href="/"
                  className="flex items-center"
                  onClick={closeMobileMenu}
                >
                  <Image
                    src="/logo.svg"
                    alt="Tech& Logo"
                    width={90}
                    height={37}
                    className="object-contain"
                  />
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav
                className="flex-1 overflow-y-auto p-4"
                aria-label="Mobile navigation"
              >
                <div className="space-y-2">
                  {/* Industries Dropdown */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() =>
                        setMobileIndustriesOpen(!mobileIndustriesOpen)
                      }
                      className="w-full flex items-center justify-between text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium transition-colors rounded-lg"
                    >
                      <span>Industries</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${
                          mobileIndustriesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {mobileIndustriesOpen && (
                      <div className="bg-gray-50 px-2 pb-3 space-y-2 animate-slideDown rounded-lg mt-1">
                        {industriesData.map((industry, index) => (
                          <div
                            key={index}
                            className="border-b border-gray-200 last:border-0"
                          >
                            <button
                              onClick={() =>
                                setMobileExpandedIndustry(
                                  mobileExpandedIndustry === industry.name
                                    ? null
                                    : industry.name,
                                )
                              }
                              className="w-full flex items-start gap-2 py-2 px-2 text-left rounded-lg hover:bg-white"
                            >
                              <div className="text-[#5B6FB6] mt-1">
                                {industry.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {industry.name}
                                  </span>
                                  <ChevronDown
                                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                                      mobileExpandedIndustry === industry.name
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </div>
                                {mobileExpandedIndustry === industry.name && (
                                  <div className="mt-2 space-y-2 animate-slideDown">
                                    <p className="text-xs text-gray-600 mb-2">
                                      {industry.description}
                                    </p>
                                    <Link
                                      href={`/industries#${industry.id}`}
                                      onClick={closeMobileMenu}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B6FB6] hover:underline"
                                    >
                                      Learn More
                                      <ChevronRight className="w-3 h-3" />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Capabilities Dropdown */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() =>
                        setMobileCapabilitiesOpen(!mobileCapabilitiesOpen)
                      }
                      className="w-full flex items-center justify-between text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium transition-colors rounded-lg"
                    >
                      <span>Capabilities</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${
                          mobileCapabilitiesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {mobileCapabilitiesOpen && (
                      <div className="bg-gray-50 px-2 pb-3 space-y-2 animate-slideDown rounded-lg mt-1">
                        {capabilitiesData.map((capability, index) => (
                          <div
                            key={index}
                            className="border-b border-gray-200 last:border-0"
                          >
                            <button
                              onClick={() =>
                                setMobileExpandedCapability(
                                  mobileExpandedCapability === capability.name
                                    ? null
                                    : capability.name,
                                )
                              }
                              className="w-full flex items-start gap-2 py-2 px-2 text-left rounded-lg hover:bg-white"
                            >
                              <div className="text-[#5B6FB6] mt-1">
                                {capability.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {capability.name}
                                  </span>
                                  <ChevronDown
                                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                                      mobileExpandedCapability ===
                                      capability.name
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </div>
                                {mobileExpandedCapability ===
                                  capability.name && (
                                  <div className="mt-2 space-y-3 animate-slideDown">
                                    <p className="text-xs text-gray-600">
                                      {capability.description}
                                    </p>
                                    <div className="space-y-2">
                                      {capability.items.map((item, idx) => {
                                        const hasIconPath =
                                          typeof item.icon === "string";
                                        const ItemWrapper = hasIconPath
                                          ? Link
                                          : "div";

                                        // Determine the correct page route based on capability category
                                        let pageRoute = "/capabilities";
                                        if (
                                          capability.name ===
                                          "Business Applications"
                                        ) {
                                          pageRoute =
                                            "/capabilities/business-applications";
                                        } else if (
                                          capability.name === "Cloud Services"
                                        ) {
                                          pageRoute =
                                            "/capabilities/cloud-services";
                                        } else if (capability.name === "Data") {
                                          pageRoute = "/capabilities/data";
                                        }

                                        const handleClick = (e) => {
                                          if (item.id) {
                                            closeMobileMenu();
                                            setTimeout(() => {
                                              const element =
                                                document.getElementById(
                                                  item.id,
                                                );
                                              if (element) {
                                                element.scrollIntoView({
                                                  behavior: "smooth",
                                                  block: "start",
                                                });
                                              }
                                            }, 100);
                                          }
                                        };

                                        const itemProps = hasIconPath
                                          ? {
                                              href: item.id
                                                ? `${pageRoute}#${item.id}`
                                                : "#",
                                              className:
                                                "flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-all duration-200 cursor-pointer",
                                              onClick: handleClick,
                                            }
                                          : {
                                              className:
                                                "flex items-center gap-2 p-2",
                                            };

                                        return (
                                          <ItemWrapper key={idx} {...itemProps}>
                                            {typeof item.icon === "string" ? (
                                              <div className="relative w-5 h-5 flex-shrink-0">
                                                <Image
                                                  src={item.icon}
                                                  alt={item.name}
                                                  fill
                                                  className="object-contain"
                                                />
                                              </div>
                                            ) : (
                                              <div className="text-[#5B6FB6]">
                                                {item.icon}
                                              </div>
                                            )}
                                            <span className="text-xs font-medium text-gray-700">
                                              {item.name}
                                            </span>
                                          </ItemWrapper>
                                        );
                                      })}
                                    </div>
                                    <Link
                                      href={
                                        capability.name === "AI"
                                          ? "/capabilities"
                                          : capability.name ===
                                              "Business Applications"
                                            ? "/capabilities/business-applications"
                                            : capability.name ===
                                                "Cloud Services"
                                              ? "/capabilities/cloud-services"
                                              : capability.name === "Data"
                                                ? "/capabilities/data"
                                                : "/capabilities"
                                      }
                                      onClick={closeMobileMenu}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B6FB6] hover:underline mt-2"
                                    >
                                      LEARN MORE
                                      <ChevronRight className="w-3 h-3" />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Insights Link */}
                  <Link
                    href="/insights"
                    className="block text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium border-b border-gray-100 transition-colors rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    Insights
                  </Link>

                  {/* What We Do Link */}
                  <Link
                    href="/whatwedo"
                    className="block text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium border-b border-gray-100 transition-colors rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    What We Do
                  </Link>

                  {/* Why Tech& Dropdown */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => setMobileWhyVitaOpen(!mobileWhyVitaOpen)}
                      className="w-full flex items-center justify-between text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium transition-colors rounded-lg"
                    >
                      <span>Why Tech&</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${
                          mobileWhyVitaOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {mobileWhyVitaOpen && (
                      <div className="bg-gray-50 px-2 pb-3 space-y-2 animate-slideDown rounded-lg mt-1">
                        <Link
                          href="/whywith-techand"
                          className="flex items-center gap-3 p-3 rounded-md bg-white hover:bg-purple-50 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <Info className="w-5 h-5 text-[#5B6FB6]" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              About Tech&
                            </div>
                            <div className="text-xs text-gray-600">
                              Learn about our mission
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/contact-us"
                          className="flex items-center gap-3 p-3 rounded-md bg-white hover:bg-purple-50 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <Phone className="w-5 h-5 text-[#5B6FB6]" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              Contact
                            </div>
                            <div className="text-xs text-gray-600">
                              Get in touch with us
                            </div>
                          </div>
                        </Link>
                        {/* <Link
                          href="/newsroom"
                          className="flex items-center gap-3 p-3 rounded-md bg-white hover:bg-purple-50 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <Newspaper className="w-5 h-5 text-[#5B6FB6]" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              Newsroom
                            </div>
                            <div className="text-xs text-gray-600">
                              Latest news and updates
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/analysts"
                          className="flex items-center gap-3 p-3 rounded-md bg-white hover:bg-purple-50 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <Search className="w-5 h-5 text-[#5B6FB6]" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              Analysts & Tech&
                            </div>
                            <div className="text-xs text-gray-600">
                              Industry insights
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/esg"
                          className="flex items-center gap-3 p-3 rounded-md bg-white hover:bg-purple-50 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <Leaf className="w-5 h-5 text-[#5B6FB6]" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              ESG & CSR
                            </div>
                            <div className="text-xs text-gray-600">
                              Sustainability initiatives
                            </div>
                          </div>
                        </Link> */}
                      </div>
                    )}
                  </div>
                </div>
              </nav>

              {/* Mobile CTA */}
              <div className="p-6 border-t border-gray-200">
                <Link
                  href="/contact-us"
                  className="flex items-center justify-center gap-2 w-full bg-[#5B6FB6] text-white px-6 py-3.5 rounded-lg hover:bg-[#4a5e9d] transition-colors font-medium"
                  onClick={closeMobileMenu}
                >
                  <span>Get Started</span>
                  <CircleArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS for slide down animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );
}
