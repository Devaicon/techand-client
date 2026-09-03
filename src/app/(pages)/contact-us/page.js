import ContactUsPage from "@/components/contactuspage/ContactUsPage";

export const metadata = {
  title: "Contact Us",
  description:
    "Talk to Tech& about enterprise automation, Dynamics 365, and digital transformation across the UAE & GCC. Let's turn technology into business impact.",
  alternates: { canonical: "/contact-us" },
};

const page = () => {
  return (
    <main>
      <ContactUsPage />
    </main>
  );
};

export default page;
