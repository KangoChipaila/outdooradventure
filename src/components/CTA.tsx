// CTA: "New to all of this?" section with green clickable link
export default function CTA() {
  return (
    <section className="w-full py-12 px-4 flex flex-col items-center text-center" aria-label="New customer call to action">
      <p className="text-2xl font-extrabold text-gray-900 uppercase tracking-wide mb-2">
        New to all of this?
      </p>
      <a
        href="#"
        className="text-2xl font-extrabold text-green-600 uppercase tracking-wide hover:text-green-800 transition-colors"
      >
        Click here to let us help you get started
      </a>
    </section>
  );
}
