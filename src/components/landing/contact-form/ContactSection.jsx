"use client";
import { useState } from "react";
import ContactFormContainer from "./ContactFormContainer";
import CallNowForm from "./CallNowForm";
import RequestCallBackForm from "./RequestCallBackForm";
import TalkToExpertForm from "./TalkToExpertForm";

const ContactSection = () => {
  const [activeTab, setActiveTab] = useState("callNow");

  return (
    <ContactFormContainer activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "callNow" && <CallNowForm />}
      {activeTab === "requestCallback" && <RequestCallBackForm />}
      {activeTab === "talkToExpert" && <TalkToExpertForm />}
    </ContactFormContainer>
  );
};

export default ContactSection;
