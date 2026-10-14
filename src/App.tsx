import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import type { Product } from "./data/products";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Deals from "./components/Deals";
import CTA from "./components/CTA";
import PopularItems from "./components/PopularItems";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import ProductPage from "./components/ProductPage";

function App() {
  const [activePage, setActivePage] = useState<Product | null>(null);

  function handleProductClick(product: Product) {
    setActivePage(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setActivePage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <CartProvider>
      {/* Navbar is always visible */}
      <Navbar />

      {activePage ? (
        /* Product detail page */
        <div className="pt-[56px]">
          <ProductPage
            product={activePage}
            onBack={handleBack}
            onProductClick={handleProductClick}
          />
        </div>
      ) : (
        /* Home page */
        <div className="min-h-screen flex flex-col">
          <main className="flex-1 flex flex-col pt-[56px]">
            <Hero />
            <Deals />
            <CTA />
            <PopularItems onProductClick={handleProductClick} />
          </main>
          <Footer />
        </div>
      )}

      {/* Cart drawer — always mounted so it can open from any page */}
      <Cart />
    </CartProvider>
  );
}

export default App;
