import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Deals from "./components/Deals";
import CTA from "./components/CTA";
import PopularItems from "./components/PopularItems";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import ProductPage from "./components/ProductPage";
import FirstTimers from "./components/FirstTimers";
import LogIn from "./components/LogIn";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col pt-[56px]">
        <Hero />
        <Deals />
        <CTA />
        <PopularItems />
      </main>
      <Footer />
    </div>
  );
}

function App() {

  const location = useLocation();

  return (
    <CartProvider>
      {/* Navbar is always visible */}
      { location.pathname != "/login" && <Navbar /> }

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<div className="pt-[56px]"><ProductPage /></div>} />
        <Route path="/firsttimers" element={<FirstTimers />} />
        <Route path="/login" element={<LogIn />}/>
      </Routes>

      {/* Cart drawer — always mounted so it can open from any page */}
      <Cart />
    </CartProvider>
  );
}

export default App;
