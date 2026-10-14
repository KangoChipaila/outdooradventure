import heroImg from "../assets/hero.png";

// Hero: full-width mountain photo with centered "DARE TO VENTURE" headline
export default function Hero() {
  return (
    <section
      className="relative w-full h-[60vh] min-h-[320px] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImg})` }}
      aria-label="Hero banner"
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      <h1 className="relative z-10 text-white text-4xl md:text-6xl font-bold tracking-[0.25em] uppercase text-center drop-shadow-lg">
        Dare to Venture
      </h1>
    </section>
  );
}
