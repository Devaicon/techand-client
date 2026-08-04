import RequestCallBackForm from "@/components/landing/contact-form/RequestCallBackForm";
import TalkToExpertForm from "@/components/landing/contact-form/TalkToExpertForm";
import SectionHeader from "./SectionHeader";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

// Which form, by the `variant` an author picks. A module-level object looked up
// by property access rather than a `resolve()` helper: the React Compiler lint
// rule `react-hooks/static-components` cannot see through a function call and
// reports "Cannot create components during render".
const FORMS = {
  callback: RequestCallBackForm,
  expert: TalkToExpertForm,
};

/**
 * The site's existing contact form, placed on a page.
 *
 * The form components are used as-is, with their `contact-page` variant. Their
 * fields, validation and submit endpoint are not something an author should be
 * able to reshape from the panel — a contact form that can be edited into one
 * that collects nothing usable is worse than no block at all.
 */
export default function ContactFormBlock({ props }) {
  const { heading, subtitle, variant, tone } = props;
  const { bg } = toneOf(tone);

  const Form = FORMS[variant] || RequestCallBackForm;

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[840px]">
        <SectionHeader heading={heading} subtitle={subtitle} tone={tone} />

        <div className="rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <Form variant="contact-page" />
        </div>
      </div>
    </section>
  );
}
