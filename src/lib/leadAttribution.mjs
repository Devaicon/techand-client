// Where a lead came from, captured in the browser and sent with the form.
//
// Two facts: the page the form was submitted on (always known), and the page
// the visit STARTED on, with any campaign tags it carried. The second is the
// one that matters — someone who lands on a blog post from LinkedIn and then
// fills in the form on /contact-us was brought in by that post, not by the
// contact page. sessionStorage holds it for the length of the visit.
//
// Every storage access is guarded. Private windows and locked-down browsers
// throw on sessionStorage, and a contact form must never fail to submit because
// analytics could not remember something.

const KEY = "techand.landing";
const MAX_PATH = 300;
const MAX_UTM = 100;

export const sessionStore = () => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

export function readUtm(search) {
  const params = new URLSearchParams(search || "");
  const out = {};
  for (const field of ["source", "medium", "campaign"]) {
    const value = params.get(`utm_${field}`);
    if (value) out[field] = value.slice(0, MAX_UTM);
  }
  return out;
}

export function recordLanding({ pathname, search }, storage) {
  if (!storage) return;
  try {
    if (storage.getItem(KEY)) return;
    storage.setItem(KEY, JSON.stringify({ landingPage: pathname, utm: readUtm(search) }));
  } catch {
    /* storage refused — attribution falls back to the source page alone */
  }
}

export function attributionFields({ pathname }, storage) {
  const out = { sourcePage: String(pathname || "/").slice(0, MAX_PATH) };

  let landing = null;
  try {
    landing = storage ? JSON.parse(storage.getItem(KEY) || "null") : null;
  } catch {
    landing = null;
  }

  if (landing?.landingPage) out.landingPage = String(landing.landingPage).slice(0, MAX_PATH);
  if (landing?.utm && Object.keys(landing.utm).length) out.utm = landing.utm;
  return out;
}

/** GA4 `generate_lead`, so Google can attribute the lead to a channel. */
export function trackLead(formType, win) {
  try {
    if (typeof win?.gtag === "function") {
      win.gtag("event", "generate_lead", { form_type: formType });
    }
  } catch {
    /* analytics must never break a submission */
  }
}
