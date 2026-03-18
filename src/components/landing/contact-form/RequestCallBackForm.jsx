"use client";
import { useState } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";

const RequestCallBackForm = ({ variant = "landing" }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    countryCode: "+971",
    phone: "",
    project: "",
    numberOfUsers: "",
    requestNDA: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(`${apiUrl}/contact-us/callback`, {
        name: formData.name,
        email: formData.email,
        service: formData.service,
        phone: `${formData.countryCode}${formData.phone}`,
        project_description: formData.project,
        number_of_users: formData.numberOfUsers,
        nda_requested: formData.requestNDA,
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitStatus({
          type: "success",
          message: "Request submitted successfully! We'll call you back soon.",
        });
        setFormData({
          name: "",
          email: "",
          service: "",
          countryCode: "+971",
          phone: "",
          project: "",
          numberOfUsers: "",
          requestNDA: false,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to submit request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isContactPage = variant === "contact-page";
  const inputClass = isContactPage
    ? "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4555A7] focus:border-transparent outline-none transition-all text-sm"
    : "w-full px-3 sm:px-4 py-2 sm:py-3 border-b-2 border-gray-200 focus:border-[#4555A7] outline-none transition-colors bg-transparent text-sm sm:text-base";
  const selectClass = isContactPage
    ? "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4555A7] focus:border-transparent outline-none transition-all text-sm bg-white text-gray-700 cursor-pointer hover:border-[#4555A7]"
    : "w-full px-4 py-3 border-b-2 border-gray-200 focus:border-[#4555A7] outline-none transition-colors bg-transparent text-gray-700 appearance-none cursor-pointer hover:border-[#4555A7]";

  return (
    <>
      <style jsx global>{`
        select {
          accent-color: var(--select-active);
          background-color: var(--select-bg);
          color: var(--select-text);
        }

        select option {
          background-color: var(--select-bg);
          color: var(--select-text);
        }

        select option:checked,
        select option:active,
        select option[selected] {
          background-color: var(--select-active) !important;
          color: var(--select-active-text) !important;
        }

        select option:hover {
          background-color: var(--select-hover) !important;
        }
      `}</style>
      {isContactPage && (
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-2">
            Request Call Back
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Fill out the form and we&apos;ll get back to you as soon as
            possible.
          </p>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 sm:space-y-4 md:space-y-6"
      >
        {/* Status Message */}
        {submitStatus && (
          <div
            className={`p-3 rounded-md ${
              submitStatus.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Name and Email Row */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            {isContactPage && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your name*
              </label>
            )}
            <input
              type="text"
              name="name"
              placeholder={isContactPage ? "Enter your name" : "Your name *"}
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`${inputClass} disabled:opacity-50`}
            />
          </div>
          <div>
            {isContactPage && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your email*
              </label>
            )}
            <input
              type="email"
              name="email"
              placeholder={isContactPage ? "Enter your email" : "Your email *"}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`${inputClass} disabled:opacity-50`}
            />
            <p className="text-xs text-gray-400 mt-1">
              We recommend using your work email.
            </p>
          </div>
        </div>

        {/* Phone Number and Service Row */}
        <div
          className={`grid ${isContactPage ? "md:grid-cols-2" : "grid-cols-1"} gap-3 sm:gap-4`}
        >
          {isContactPage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="PK: +92 (xxx) xxxxxxx"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`${inputClass} disabled:opacity-50`}
              />
            </div>
          )}
          <div>
            {isContactPage && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select the service you need*
              </label>
            )}
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`${selectClass} disabled:opacity-50`}
              style={
                !isContactPage
                  ? {
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }
                  : {}
              }
            >
              <option value="">
                {isContactPage
                  ? "Select a service"
                  : "Select the service you need *"}
              </option>
              <option value="AI">AI</option>
              <option value="Business Applications">
                Business Applications
              </option>
              <option value="Cloud Services">Cloud Services</option>
              <option value="Data">Data</option>
            </select>
          </div>
        </div>

        {/* Phone Number (Landing variant only) */}
        {!isContactPage && (
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              disabled={isSubmitting}
              className="px-2 py-3 border-b-2 border-gray-200 focus:border-[#4555A7] outline-none transition-colors bg-white w-32 text-sm disabled:opacity-50 cursor-pointer text-gray-700 hover:border-[#4555A7]"
              style={{
                borderRadius: "4px",
              }}
            >
              <option value="+93">AF +93</option>
              <option value="+355">AL +355</option>
              <option value="+213">DZ +213</option>
              <option value="+1">US +1</option>
              <option value="+376">AD +376</option>
              <option value="+244">AO +244</option>
              <option value="+54">AR +54</option>
              <option value="+374">AM +374</option>
              <option value="+61">AU +61</option>
              <option value="+43">AT +43</option>
              <option value="+994">AZ +994</option>
              <option value="+973">BH +973</option>
              <option value="+880">BD +880</option>
              <option value="+375">BY +375</option>
              <option value="+32">BE +32</option>
              <option value="+501">BZ +501</option>
              <option value="+229">BJ +229</option>
              <option value="+975">BT +975</option>
              <option value="+591">BO +591</option>
              <option value="+387">BA +387</option>
              <option value="+267">BW +267</option>
              <option value="+55">BR +55</option>
              <option value="+673">BN +673</option>
              <option value="+359">BG +359</option>
              <option value="+226">BF +226</option>
              <option value="+257">BI +257</option>
              <option value="+855">KH +855</option>
              <option value="+237">CM +237</option>
              <option value="+1">CA +1</option>
              <option value="+238">CV +238</option>
              <option value="+236">CF +236</option>
              <option value="+235">TD +235</option>
              <option value="+56">CL +56</option>
              <option value="+86">CN +86</option>
              <option value="+57">CO +57</option>
              <option value="+269">KM +269</option>
              <option value="+242">CG +242</option>
              <option value="+243">CD +243</option>
              <option value="+506">CR +506</option>
              <option value="+385">HR +385</option>
              <option value="+53">CU +53</option>
              <option value="+357">CY +357</option>
              <option value="+420">CZ +420</option>
              <option value="+45">DK +45</option>
              <option value="+253">DJ +253</option>
              <option value="+593">EC +593</option>
              <option value="+20">EG +20</option>
              <option value="+503">SV +503</option>
              <option value="+240">GQ +240</option>
              <option value="+291">ER +291</option>
              <option value="+372">EE +372</option>
              <option value="+251">ET +251</option>
              <option value="+679">FJ +679</option>
              <option value="+358">FI +358</option>
              <option value="+33">FR +33</option>
              <option value="+241">GA +241</option>
              <option value="+220">GM +220</option>
              <option value="+995">GE +995</option>
              <option value="+49">DE +49</option>
              <option value="+233">GH +233</option>
              <option value="+30">GR +30</option>
              <option value="+502">GT +502</option>
              <option value="+224">GN +224</option>
              <option value="+245">GW +245</option>
              <option value="+592">GY +592</option>
              <option value="+509">HT +509</option>
              <option value="+504">HN +504</option>
              <option value="+852">HK +852</option>
              <option value="+36">HU +36</option>
              <option value="+354">IS +354</option>
              <option value="+91">IN +91</option>
              <option value="+62">ID +62</option>
              <option value="+98">IR +98</option>
              <option value="+964">IQ +964</option>
              <option value="+353">IE +353</option>
              <option value="+972">IL +972</option>
              <option value="+39">IT +39</option>
              <option value="+225">CI +225</option>
              <option value="+81">JP +81</option>
              <option value="+962">JO +962</option>
              <option value="+7">KZ +7</option>
              <option value="+254">KE +254</option>
              <option value="+965">KW +965</option>
              <option value="+996">KG +996</option>
              <option value="+856">LA +856</option>
              <option value="+371">LV +371</option>
              <option value="+961">LB +961</option>
              <option value="+266">LS +266</option>
              <option value="+231">LR +231</option>
              <option value="+218">LY +218</option>
              <option value="+423">LI +423</option>
              <option value="+370">LT +370</option>
              <option value="+352">LU +352</option>
              <option value="+853">MO +853</option>
              <option value="+389">MK +389</option>
              <option value="+261">MG +261</option>
              <option value="+265">MW +265</option>
              <option value="+60">MY +60</option>
              <option value="+960">MV +960</option>
              <option value="+223">ML +223</option>
              <option value="+356">MT +356</option>
              <option value="+222">MR +222</option>
              <option value="+230">MU +230</option>
              <option value="+52">MX +52</option>
              <option value="+373">MD +373</option>
              <option value="+377">MC +377</option>
              <option value="+976">MN +976</option>
              <option value="+382">ME +382</option>
              <option value="+212">MA +212</option>
              <option value="+258">MZ +258</option>
              <option value="+95">MM +95</option>
              <option value="+264">NA +264</option>
              <option value="+977">NP +977</option>
              <option value="+31">NL +31</option>
              <option value="+64">NZ +64</option>
              <option value="+505">NI +505</option>
              <option value="+227">NE +227</option>
              <option value="+234">NG +234</option>
              <option value="+850">KP +850</option>
              <option value="+47">NO +47</option>
              <option value="+968">OM +968</option>
              <option value="+92">PK +92</option>
              <option value="+970">PS +970</option>
              <option value="+507">PA +507</option>
              <option value="+675">PG +675</option>
              <option value="+595">PY +595</option>
              <option value="+51">PE +51</option>
              <option value="+63">PH +63</option>
              <option value="+48">PL +48</option>
              <option value="+351">PT +351</option>
              <option value="+974">QA +974</option>
              <option value="+40">RO +40</option>
              <option value="+7">RU +7</option>
              <option value="+250">RW +250</option>
              <option value="+966">SA +966</option>
              <option value="+221">SN +221</option>
              <option value="+381">RS +381</option>
              <option value="+248">SC +248</option>
              <option value="+232">SL +232</option>
              <option value="+65">SG +65</option>
              <option value="+421">SK +421</option>
              <option value="+386">SI +386</option>
              <option value="+252">SO +252</option>
              <option value="+27">ZA +27</option>
              <option value="+82">KR +82</option>
              <option value="+211">SS +211</option>
              <option value="+34">ES +34</option>
              <option value="+94">LK +94</option>
              <option value="+249">SD +249</option>
              <option value="+597">SR +597</option>
              <option value="+268">SZ +268</option>
              <option value="+46">SE +46</option>
              <option value="+41">CH +41</option>
              <option value="+963">SY +963</option>
              <option value="+886">TW +886</option>
              <option value="+992">TJ +992</option>
              <option value="+255">TZ +255</option>
              <option value="+66">TH +66</option>
              <option value="+228">TG +228</option>
              <option value="+216">TN +216</option>
              <option value="+90">TR +90</option>
              <option value="+993">TM +993</option>
              <option value="+256">UG +256</option>
              <option value="+380">UA +380</option>
              <option value="+971">AE +971</option>
              <option value="+44">UK +44</option>
              <option value="+598">UY +598</option>
              <option value="+998">UZ +998</option>
              <option value="+58">VE +58</option>
              <option value="+84">VN +84</option>
              <option value="+967">YE +967</option>
              <option value="+260">ZM +260</option>
              <option value="+263">ZW +263</option>
            </select>
            <input
              type="tel"
              name="phone"
              placeholder="(xxx) xxxxxxx*"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border-b-2 border-gray-200 focus:border-[#4555A7] outline-none transition-colors bg-transparent disabled:opacity-50"
            />
          </div>
        )}

        {/* Project Description */}
        <div>
          {isContactPage && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Please describe your project*
            </label>
          )}
          <textarea
            name="project"
            placeholder={
              isContactPage
                ? "Describe your project..."
                : "Please describe your project. *"
            }
            value={formData.project}
            onChange={handleChange}
            required
            rows={isContactPage ? "4" : "3"}
            disabled={isSubmitting}
            className={`${isContactPage ? "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4555A7] focus:border-transparent outline-none transition-all resize-none text-sm" : "w-full px-3 sm:px-4 py-2 sm:py-3 border-b-2 border-gray-200 focus:border-[#4555A7] outline-none transition-colors bg-transparent resize-none text-sm sm:text-base"} disabled:opacity-50`}
          ></textarea>
        </div>

        {/* Number of Users */}
        <div>
          {isContactPage && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Users*
            </label>
          )}
          {isContactPage ? (
            <input
              type="text"
              name="numberOfUsers"
              placeholder="Enter number of users"
              value={formData.numberOfUsers}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`${inputClass} disabled:opacity-50`}
            />
          ) : (
            <select
              name="numberOfUsers"
              value={formData.numberOfUsers}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-b-2 border-gray-200 focus:border-[#4555A7] outline-none transition-colors bg-transparent text-gray-700 appearance-none cursor-pointer text-sm sm:text-base disabled:opacity-50 hover:border-[#4555A7]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
              }}
            >
              <option value="">Number of Users *</option>
              <option value="1-10">1 - 10 Users</option>
              <option value="11-50">11 - 50 Users</option>
              <option value="51-100">51 - 100 Users</option>
              <option value="101-250">101 - 250 Users</option>
              <option value="251-500">251 - 500 Users</option>
              <option value="above-500">Above 500 Users</option>
            </select>
          )}
        </div>

        {/* NDA Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="requestNDA"
            id="requestNDA"
            checked={formData.requestNDA}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-4 h-4 border-gray-300 rounded disabled:opacity-50 ${isContactPage ? "focus:ring-2 focus:ring-[#4555A7] text-[#4555A7]" : "text-[#281333] focus:ring-[#281333]"}`}
          />
          <label
            htmlFor="requestNDA"
            className="text-gray-600 text-sm cursor-pointer"
          >
            Request NDA
          </label>
        </div>

        {/* Submit Button */}
        <div>
          {isContactPage ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(180deg, #4555A7 0%, #53406B 100%)",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
              <span>→</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-[181.5px] h-[51.6px] rounded-[5px] bg-white border border-[#3E234C] shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit"
            >
              <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-b from-[#3E234C] to-[#6C3C85]">
                {isSubmitting ? "Submitting..." : "Submit"}
              </span>
              {!isSubmitting && (
                <span className="transform transition-transform group-hover:translate-x-1">
                  <ArrowRight size={16} color="#6C3C85" />
                </span>
              )}
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default RequestCallBackForm;
