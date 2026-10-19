import heroImg from "../assets/HeroImg.png";

// Hero: full-width mountain photo with centered "DARE TO VENTURE" headline
export default function Hero() {
  return (
    <section
      className="relative w-full h-[70vh] min-h-[320px] flex items-center justify-center bg-cover bg-center before:absolute before:inset-0 before:bg-black/60"
      style={{ backgroundImage: `url(${heroImg})` }}
      aria-label="Hero banner"
    >
      <h1 className="relative z-10 text-white text-5xl font-bold uppercase text-center drop-shadow-lg">
        DARE TO VENTURE
      </h1>
    </section>
  );
}
