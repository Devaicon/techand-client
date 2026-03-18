"use client";

import { useState } from "react";
import Image from "next/image";
import CapabilitiesCards from "./CapabilitiesCards";

const CATEGORIES = ["AI", "Business Applications", "Cloud Services", "Data"];

const CAPABILITIES_DATA = [
  // Artificial Intelligence (AI)
  {
    id: 1,
    image: "/icons/microsoft-copilot.svg",
    title: "Microsoft Copilot for Microsoft 365",
    description:
      "Smart tools built into Microsoft 365 make writing, analyzing data, and completing work tasks faster and easier for teams.",
    category: "AI",
    slug: "microsoft-copilot-m365",
  },
  {
    id: 2,
    image: "/icons/Dynamics365_scalable.svg",
    title: "Dynamics 365 Copilot",
    description:
      "AI assistance is built right into sales, finance, customer service, and supply chain programs.",
    category: "AI",
    slug: "dynamics-365-copilot",
  },
  {
    id: 3,
    image: "/icons/azure/03438-icon-service-Azure-OpenAI.svg",
    title: "Azure OpenAI Service",
    description:
      "Safe access to advanced AI technology that companies can use to build smart applications for their business needs.",
    category: "AI",
    slug: "azure-openai-service",
  },
  {
    id: 4,
    image: "/icons/CopilotStudio_scalable.svg",
    title: "Copilot Studio",
    description:
      "Tools that let businesses create their own AI helpers and chatbots designed specifically for how their company works.",
    category: "AI",
    slug: "copilot-studio",
  },
  {
    id: 5,
    image: "/icons/AIBuilder_scalable.svg",
    title: "AI Builder",
    description:
      "Simple, no-coding-required AI tools that can make predictions, handle documents, and process information automatically.",
    category: "AI",
    slug: "ai-builder",
  },
  {
    id: 6,
    image: "/icons/azure/10162-icon-service-Cognitive-Services.svg",
    title: "Azure AI Services",
    description:
      "Access ready-to-use AI features that add picture recognition, language understanding, and voice capabilities to business programs.",
    category: "AI",
    slug: "azure-ai-services",
  },
  {
    id: 7,
    image: "/icons/azure/00819-icon-service-Form-Recognizers.svg",
    title: "Intelligent Document Processing",
    description:
      "AI-powered systems for document processing that read documents, pull out important data automatically, and reduce mistakes from manual typing.",
    category: "AI",
    slug: "intelligent-document-processing",
  },
  {
    id: 8,
    image: "/icons/azure/10166-icon-service-Machine-Learning.svg",
    title: "Predictive AI Models",
    description:
      "AI programs that forecast future trends and suggest the best actions to help businesses make smarter choices.",
    category: "AI",
    slug: "predictive-ai-models",
  },
  // Business Applications
  {
    id: 9,
    image: "/icons/Finance_scalable.svg",
    title: "Dynamics 365 Finance",
    description:
      "System that gives companies better control over money, creates detailed reports, and shows what's happening across the entire business.",
    category: "Business Applications",
    slug: "dynamics-365-finance",
  },
  {
    id: 10,
    image: "/icons/SupplyChainManagement_scalable.svg",
    title: "Dynamics 365 Supply Chain Management",
    description:
      "Platform that helps companies plan inventory, track products, and manage shipping from start to finish.",
    category: "Business Applications",
    slug: "dynamics-365-supply-chain-management",
  },
  {
    id: 11,
    image: "/icons/Sales_scalable.svg",
    title: "Dynamics 365 Sales",
    description:
      "Software that helps sales teams track potential customers, predict future sales, and build stronger relationships with clients.",
    category: "Business Applications",
    slug: "dynamics-365-sales",
  },
  {
    id: 12,
    image: "/icons/CustomerServices_scalable.svg",
    title: "Dynamics 365 Customer Service",
    description:
      "Platform that helps support teams respond to customers quickly through phone, email, chat, and other channels all in one place.",
    category: "Business Applications",
    slug: "dynamics-365-customer-service",
  },
  {
    id: 13,
    image: "/icons/FieldService_scalable.svg",
    title: "Dynamics 365 Field Service",
    description:
      "Software that organizes technician schedules, tracks equipment, and manages work done at customer locations.",
    category: "Business Applications",
    slug: "dynamics-365-field-service",
  },
  {
    id: 14,
    image: "/icons/ProjectOperations_scalable.svg",
    title: "Dynamics 365 Project Operations",
    description:
      "System that connects project planning, actual work completion, and budget tracking in one place.",
    category: "Business Applications",
    slug: "dynamics-365-project-operations",
  },
  {
    id: 15,
    image: "/icons/HumanResources_scalable.svg",
    title: "Dynamics 365 Human Resources",
    description:
      "HR software that helps companies manage employees, follow employment rules, and understand their workforce better.",
    category: "Business Applications",
    slug: "dynamics-365-human-resources",
  },
  {
    id: 16,
    image: "/icons/Commerce_scalable.svg",
    title: "Dynamics 365 Commerce",
    description:
      "Shopping system that connects online stores, physical retail locations, and customer experiences everywhere.",
    category: "Business Applications",
    slug: "dynamics-365-commerce",
  },
  {
    id: 17,
    image: "/icons/BusinessCentral_scalable.svg",
    title: "Dynamics 365 Business Central",
    description:
      "Easy-to-use business management software designed for growing companies to handle everyday operations.",
    category: "Business Applications",
    slug: "dynamics-365-business-central",
  },
  // Cloud Services
  {
    id: 18,
    image: "/icons/azure/10018-icon-service-Azure-A.svg",
    title: "Microsoft Azure Infrastructure",
    description:
      "Expandable cloud computing power that provides secure servers, storage space, and network connections.",
    category: "Cloud Services",
    slug: "microsoft-azure-infrastructure",
  },
  {
    id: 19,
    image: "/icons/azure/10035-icon-service-App-Services.svg",
    title: "Azure App Services & Web Apps",
    description:
      "Managed platform for creating and running secure websites and business applications.",
    category: "Cloud Services",
    slug: "azure-app-services-web-apps",
  },
  {
    id: 20,
    image: "/icons/kubernetes.svg",
    title: "Azure Kubernetes Service",
    description:
      "Technology that helps teams launch and grow modern applications using containers.",
    category: "Cloud Services",
    slug: "azure-kubernetes-service",
  },
  {
    id: 21,
    image: "/icons/azure/00327-icon-service-Azure-Virtual-Desktop.svg",
    title: "Azure Virtual Desktop",
    description:
      "Secure computer desktops accessed remotely that support working from anywhere while IT maintains control.",
    category: "Cloud Services",
    slug: "azure-virtual-desktop",
  },
  {
    id: 22,
    image: "/icons/PowerAutomate_scalable.svg",
    title: "Azure Integration Services",
    description:
      "Tools that connect different software systems, automate repetitive processes, and manage how programs communicate.",
    category: "Cloud Services",
    slug: "azure-integration-services",
  },
  {
    id: 23,
    image: "/icons/azure/00321-icon-service-Security.svg",
    title: "Azure Security & Identity",
    description:
      "Protection services that keep users, information, and computer systems safe across cloud environments.",
    category: "Cloud Services",
    slug: "azure-security-identity",
  },
  {
    id: 24,
    image: "/icons/azure/10261-icon-service-Azure-DevOps.svg",
    title: "Azure DevOps & CI/CD Pipelines",
    description:
      "Choose development tools that automatically test code, launch updates, and deliver new software features.",
    category: "Cloud Services",
    slug: "azure-devops-cicd-pipelines",
  },
  {
    id: 25,
    image: "/icons/azure/10281-icon-service-Azure-Migrate.svg",
    title: "Cloud Migration & Modernization",
    description:
      "Organized methods to safely move existing systems to the cloud and update them with new technology.",
    category: "Cloud Services",
    slug: "cloud-migration-modernization",
  },
  // Data
  {
    id: 26,
    image: "/icons/PowerPlatform_scalable.svg",
    title: "Microsoft Fabric",
    description:
      "A combined data platform that brings together analytics, reporting, and data science capabilities.",
    category: "Data",
    slug: "microsoft-fabric",
  },
  {
    id: 27,
    image: "/icons/azure/10126-icon-service-Data-Factories.svg",
    title: "Azure Data Factory",
    description:
      "Complete service that moves information between different systems and transforms it into usable formats.",
    category: "Data",
    slug: "azure-data-factory",
  },
  {
    id: 28,
    image: "/icons/azure/00606-icon-service-Azure-Synapse-Analytics.svg",
    title: "Azure Synapse Analytics",
    description:
      "Easier platform for processing massive amounts of data and creating advanced reports.",
    category: "Data",
    slug: "azure-synapse-analytics",
  },
  {
    id: 29,
    image: "/icons/azure/03332-icon-service-Power-BI-Embedded.svg",
    title: "Power BI",
    description:
      "Access interactive charts and dashboards that turn raw business data into clear, understandable insights.",
    category: "Data",
    slug: "power-bi",
  },
  {
    id: 30,
    image: "/icons/Dataverse_scalable.svg",
    title: "OneLake",
    description:
      "An easy central storage location makes it easy to save and access data across different analytics tools.",
    category: "Data",
    slug: "onelake",
  },
  {
    id: 31,
    image: "/icons/azure/10130-icon-service-SQL-Database.svg",
    title: "Azure SQL & Managed Databases",
    description:
      "Reliable database systems designed to work fast, stay secure, and remain available when needed.",
    category: "Data",
    slug: "azure-sql-managed-databases",
  },
  {
    id: 32,
    image: "/icons/azure/10145-icon-service-Azure-Data-Explorer-Clusters.svg",
    title: "Real-Time Analytics",
    description:
      "Technology that analyzes events and operational activities as they happen right now.",
    category: "Data",
    slug: "real-time-analytics",
  },
  {
    id: 33,
    image: "/icons/azure/00011-icon-service-Compliance.svg",
    title: "Data Governance & Security (Microsoft Purview)",
    description:
      "Tools that help companies control who can access data, follow regulations, and ensure information is trustworthy.",
    category: "Data",
    slug: "data-governance-security",
  },
];

// Map category names to capabilities page URLs
const CATEGORY_TO_URL = {
  AI: "capabilities",
  "Business Applications": "capabilities/business-applications",
  "Cloud Services": "capabilities/cloud-services",
  Data: "capabilities/data",
};

export default function Capabilities() {
  const [activeCategory, setActiveCategory] = useState("AI");

  const filteredCapabilities =
    activeCategory === "All"
      ? CAPABILITIES_DATA
      : CAPABILITIES_DATA.filter((item) => item.category === activeCategory);

  const activeCategoryUrl = CATEGORY_TO_URL[activeCategory];

  return (
    <section className="w-full min-h-screen bg-[#dce5ed] flex flex-col items-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
      <div className="w-full max-w-[1180px] flex flex-col items-center rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="w-full min-h-[160px] sm:min-h-[180px] md:h-[200px] lg:h-[230px] bg-[rgba(74,45,88,1)] text-white flex flex-col items-center justify-center px-4 py-6">
          <div className="w-[130px] h-[130px] bg-[#37469E] rounded-tl-[62.98px] rounded-br-[62.98px] rounded-bl-[3.91px] opacity-100 flex items-center justify-center">
            <Image
              src="/footer-logo1.png"
              alt="Capabilities Icon"
              width={100}
              height={80}
              priority
              className="w-[60px] h-[48px] sm:w-[80px] sm:h-[64px] md:w-[100px] md:h-[80px]"
            />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-center my-2">
            Tech& Capabilities
          </h1>
          <p className="text-xs sm:text-sm md:text-base font-normal text-[#f2f2f2] text-center mb-4 px-2">
            Enterprise platforms, AI, and integration services
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 sm:gap-4 md:gap-5 py-4 sm:py-6 md:py-8 lg:py-10 w-full px-4">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`flex-1 h-[45px] sm:h-[50px] md:h-[55px] lg:h-[59px] px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-[10px] rounded-[36px] text-xs sm:text-sm md:text-base font-medium text-white whitespace-nowrap cursor-pointer
                bg-gradient-to-b from-[#3e234c] to-[#6c3c85]
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgba(90,58,104,0.5)]
                transition-colors duration-200
                ${activeCategory === category ? "bg-[#6b4775]" : ""}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-4 w-full px-4 pb-6 sm:pb-8 md:pb-10">
          {filteredCapabilities.map((capability) => (
            <CapabilitiesCards
              key={capability.id}
              {...capability}
              categoryUrl={activeCategoryUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
