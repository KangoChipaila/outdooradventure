import { useState } from "react";
import Footer from "./Footer";

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQ_SECTIONS = [
  {
    section: "Orders & Shipping",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    faqs: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery within Lusaka takes 1–2 business days. Deliveries to other provinces typically take 3–5 business days depending on location.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! Orders over ZMW 2,500 qualify for free standard shipping. A flat shipping fee of ZMW 199 applies to orders below that threshold.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely. Once your order ships you'll receive an SMS and email with a tracking number you can use on our courier partner's website.",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 1 hour of being placed. After that, the order enters processing and can no longer be changed. Contact us immediately via WhatsApp or email if you need to make a change.",
      },
    ],
  },
  {
    section: "Returns & Refunds",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
      </svg>
    ),
    faqs: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 30 days of purchase for items in their original, unused condition with all tags attached. Sale items are final sale and cannot be returned.",
      },
      {
        q: "How do I initiate a return?",
        a: "Contact our support team via the Help & Feedback page or email us at returns@greenrockoutdoorgear.com. We'll send you a return label and instructions within 24 hours.",
      },
      {
        q: "How long do refunds take?",
        a: "Once we receive and inspect the returned item, refunds are processed within 5–7 business days back to your original payment method.",
      },
      {
        q: "What if my item arrives damaged?",
        a: "Take photos of the damage and contact us within 48 hours of receiving the order. We'll arrange a replacement or full refund at no extra cost to you.",
      },
    ],
  },
  {
    section: "Products & Stock",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    faqs: [
      {
        q: "Are all products genuine / authentic?",
        a: "Yes. Green Rock Outdoor Gear is an authorised stockist for all brands we carry. Every product is sourced directly from the brand or their official distributors.",
      },
      {
        q: "What if an item I want is out of stock?",
        a: "You can add out-of-stock items to your wishlist and we'll notify you by email as soon as they're back. Alternatively, contact us and we can often source specific items on request.",
      },
      {
        q: "Do you offer size guides?",
        a: "Yes. Each product page includes a link to the brand's official size guide. If you're unsure, our team is happy to advise — just send us a message.",
      },
    ],
  },
  {
    section: "Account & Payments",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Visa, Mastercard, PayPal, and mobile money (Airtel Money & MTN MoMo). All transactions are secured with TLS encryption.",
      },
      {
        q: "Is my payment information stored?",
        a: "We never store card details on our servers. Payments are processed through our PCI-DSS compliant payment gateway.",
      },
      {
        q: "Can I use a promo code?",
        a: "Yes — enter your promo code in the cart before checkout. Codes are case-insensitive and only one code can be applied per order.",
      },
      {
        q: "How do I reset my password?",
        a: "On the login page, click 'Forgot password?' and enter your email. You'll receive a reset link within a few minutes. Check your spam folder if it doesn't arrive.",
      },
    ],
  },
];

// ─── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-gray-900 hover:text-green-700 transition-colors"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className={`w-4 h-4 shrink-0 text-green-600 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isOpen && (
        <p className="pb-4 text-sm text-gray-600 leading-relaxed pr-8">{answer}</p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FAQs() {
  // Track which question is open: "sectionIndex-faqIndex"
  const [openKey, setOpenKey] = useState<string | null>("0-0");

  function toggle(key: string) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Hero ── */}
      <div className="bg-green-700 pt-[56px]">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center text-white">
          <p className="text-xs font-bold tracking-widest uppercase text-green-200 mb-2">
            Support
          </p>
          <h1 className="text-4xl font-extrabold mb-3">Frequently Asked Questions</h1>
          <p className="text-green-200 text-sm max-w-md mx-auto">
            Can't find what you're looking for?{" "}
            <a href="/help" className="underline text-white hover:text-green-100 transition-colors">
              Contact our team
            </a>{" "}
            and we'll be happy to help.
          </p>
        </div>
      </div>

      {/* ── FAQ sections ── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 flex flex-col gap-6">
        {FAQ_SECTIONS.map((section, si) => (
          <div
            key={section.section}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Section header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
              <span className="text-green-600">{section.icon}</span>
              <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
                {section.section}
              </h2>
            </div>

            {/* Accordion items */}
            <div className="px-6">
              {section.faqs.map((faq, fi) => {
                const key = `${si}-${fi}`;
                return (
                  <AccordionItem
                    key={key}
                    question={faq.q}
                    answer={faq.a}
                    isOpen={openKey === key}
                    onToggle={() => toggle(key)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Still have questions CTA */}
        <div className="bg-green-700 rounded-2xl px-6 py-8 text-center text-white">
          <h3 className="text-lg font-bold mb-2">Still have a question?</h3>
          <p className="text-green-200 text-sm mb-5">
            Our team typically responds within a few hours on business days.
          </p>
          <a
            href="/help"
            className="inline-block bg-white text-green-800 font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:bg-green-50 transition-colors"
          >
            Get in touch
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
