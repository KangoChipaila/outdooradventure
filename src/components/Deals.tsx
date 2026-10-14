// Placeholder icon for category images not yet available
function ImgPlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.2}
        stroke="currentColor"
        className={`${sizeClass} text-gray-400`}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    </div>
  );
}

// Deals section: featured camping deal on the left + category grid on the right
export default function Deals() {
  // Category tiles on the right — each has 2 rows of 2 placeholder images
  const categories = [
    { label: "Hiking", cols: 2 },
    { label: "Climbing", cols: 1 },
    { label: "Water Sports", cols: 1 },
  ];

  return (
    <section className="w-full grid grid-cols-4 min-h-[200px]" aria-label="Deals and categories">
      {/* Featured deal — left tile, spans 1 col */}
      <a
        href="#"
        className="relative col-span-1 bg-cover bg-center overflow-hidden group min-h-[200px]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80')",
        }}
        aria-label="70% off on all camping deals"
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        <div className="absolute bottom-4 left-4 bg-red-600 text-white text-sm font-bold px-2 py-1 leading-tight z-10">
          70% off on all<br />camping deals
        </div>
      </a>

      {/* Category grid — right 3 cols, each split into 2×2 sub-grid */}
      {categories.map((cat) => (
        <a
          key={cat.label}
          href="#"
          className="col-span-1 grid grid-cols-2 grid-rows-2 bg-gray-200 border border-gray-300 hover:bg-gray-100 transition-colors"
          aria-label={cat.label}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-center bg-gray-200 border border-gray-300 aspect-square"
            >
              <ImgPlaceholder size="sm" />
            </div>
          ))}
        </a>
      ))}
    </section>
  );
}
