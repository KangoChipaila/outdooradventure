import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Deals from "./components/Deals";
import CTA from "./components/CTA";
import PopularItems from "./components/PopularItems";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import Wishlist from "./components/Wishlist";
import ProductPage from "./components/ProductPage";
import FirstTimers from "./components/FirstTimers";
import LogIn from "./components/LogIn";
import UserProfile from "./components/UserProfile";
import CategoryPage from "./components/CategoryPage";
import FAQs from "./components/FAQs";
import HelpAndFeedback from "./components/HelpAndFeedback";

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
      <WishlistProvider>
        {/* Navbar is always visible */}
        { location.pathname != "/login" && <Navbar /> }

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<div className="pt-[56px]"><ProductPage /></div>} />
          <Route path="/firsttimers" element={<FirstTimers />} />
          <Route path="/login" element={<LogIn />}/>
          <Route path="/profile" element={<UserProfile />}/>
          <Route path="/category/:slug" element={<CategoryPage />}/>
          <Route path="/faqs" element={<FAQs />}/>
          <Route path="/help" element={<HelpAndFeedback />}/>
        </Routes>

        {/* Cart drawer — always mounted so it can open from any page */}
        <Cart />
        {/* Wishlist drawer — always mounted so it can open from any page */}
        <Wishlist />
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
