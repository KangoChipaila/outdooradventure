import { useState } from "react";
import Footer from "./Footer";

// ─── Contact channels ─────────────────────────────────────────────────────────
const CHANNELS = [
  {
    label: "WhatsApp",
    detail: "+260 97 000 0000",
    subtext: "Typically replies within an hour",
    href: "https://wa.me/260970000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.527 5.845L.057 23.25l5.551-1.453A11.932 11.932 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.792 9.792 0 0 1-5.004-1.373l-.358-.214-3.297.864.881-3.208-.234-.371A9.763 9.763 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
      </svg>
    ),
    color: "bg-green-500",
  },
  {
    label: "Email",
    detail: "support@greenrockoutdoorgear.com",
    subtext: "We reply within 24 hours",
    href: "mailto:support@greenrockoutdoorgear.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    color: "bg-blue-500",
  },
  {
    label: "Phone",
    detail: "+260 21 100 0000",
    subtext: "Mon – Fri, 08:00 – 17:00 CAT",
    href: "tel:+260211000000",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
    color: "bg-gray-700",
  },
];

// ─── Feedback types ───────────────────────────────────────────────────────────
const FEEDBACK_TYPES = [
  "General Enquiry",
  "Order Issue",
  "Return / Refund",
  "Product Question",
  "Website Feedback",
  "Other",
];

// ─── Form state type ──────────────────────────────────────────────────────────
interface FeedbackForm {
  name: string;
  email: string;
  type: string;
  orderNumber: string;
  message: string;
}

const EMPTY_FORM: FeedbackForm = {
  name: "",
  email: "",
  type: FEEDBACK_TYPES[0],
  orderNumber: "",
  message: "",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HelpAndFeedback() {
  const [form, setForm] = useState<FeedbackForm>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FeedbackForm>>({});

  function validate(): boolean {
    const e: Partial<FeedbackForm> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address.";
    }
    if (!form.message.trim()) e.message = "Please describe your issue or feedback.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    // In a real app, POST to API here
    setSubmitted(true);
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
  }

  function field(key: keyof FeedbackForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Hero ── */}
      <div className="bg-green-700">
        <div className="max-w-4xl mx-auto px-4 py-14 text-white">
          <p className="text-xs font-bold tracking-widest uppercase text-green-200 mb-2">
            Support
          </p>
          <h1 className="text-4xl font-extrabold mb-2">Help & Feedback</h1>
          <p className="text-green-200 text-sm max-w-lg">
            Got a question, an issue with an order, or just want to tell us how
            we're doing? We're all ears.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 flex flex-col gap-8">
        {/* ── Contact channels ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CHANNELS.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith("http") ? "_blank" : undefined}
              rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <div
                className={`w-10 h-10 rounded-xl ${ch.color} text-white flex items-center justify-center`}
              >
                {ch.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{ch.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 break-all">{ch.detail}</p>
                <p className="text-[10px] text-gray-400 mt-1">{ch.subtext}</p>
              </div>
            </a>
          ))}
        </div>

        {/* ── Feedback form ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-6">
            Send us a message
          </h2>

          {submitted ? (
            /* Success state */
            <div className="flex flex-col items-center text-center py-10 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8 text-green-600"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Message sent!</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Thanks, {form.name.split(" ")[0]}. We'll get back to you at{" "}
                <strong>{form.email}</strong> within 24 hours.
              </p>
              <button
                onClick={handleReset}
                className="mt-2 text-xs font-bold text-white bg-gray-900 rounded-full py-2.5 px-6 hover:bg-gray-700 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="hf-name" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="hf-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => field("name", e.target.value)}
                    placeholder="Alex Mwale"
                    className={`border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                      errors.name ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="hf-email" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="hf-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => field("email", e.target.value)}
                    placeholder="you@email.com"
                    className={`border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                      errors.email ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Type + Order number row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="hf-type" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    What's this about?
                  </label>
                  <select
                    id="hf-type"
                    value={form.type}
                    onChange={(e) => field("type", e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-800"
                  >
                    {FEEDBACK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="hf-order" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number{" "}
                    <span className="text-gray-300 font-normal normal-case tracking-normal">
                      (if applicable)
                    </span>
                  </label>
                  <input
                    id="hf-order"
                    type="text"
                    value={form.orderNumber}
                    onChange={(e) => field("orderNumber", e.target.value)}
                    placeholder="ORD-00142"
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="hf-message" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="hf-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => field("message", e.target.value)}
                  placeholder="Tell us what's on your mind…"
                  className={`border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-colors ${
                    errors.message ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.message && (
                  <p className="text-xs text-red-500">{errors.message}</p>
                )}
                <p className="text-[10px] text-gray-400 self-end">
                  {form.message.length} / 1000
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="self-start text-xs font-bold text-white bg-green-600 rounded-full py-3 px-8 hover:bg-green-700 transition-colors uppercase tracking-widest"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* ── Store info ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-5">
            Visit Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</p>
              <p className="text-sm text-gray-800 leading-relaxed mt-1">
                Green Rock Outdoor Gear<br />
                Plot 1234, Cairo Road<br />
                Lusaka, Zambia
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Store Hours</p>
              <ul className="text-sm text-gray-800 leading-relaxed mt-1 space-y-0.5">
                <li className="flex justify-between max-w-[200px]">
                  <span>Mon – Fri</span>
                  <span className="font-medium">08:00 – 18:00</span>
                </li>
                <li className="flex justify-between max-w-[200px]">
                  <span>Saturday</span>
                  <span className="font-medium">09:00 – 15:00</span>
                </li>
                <li className="flex justify-between max-w-[200px]">
                  <span>Sunday</span>
                  <span className="text-gray-400">Closed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
