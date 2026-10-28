import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import WishlistSync from "./components/WishlistSync";
import Navbar from "./components/Navbar";
import AdminPage from "./components/AdminPage";
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
import SignUp from "./components/SignUp";
import UserProfile from "./components/UserProfile";
import CategoryPage from "./components/CategoryPage";
import FAQs from "./components/FAQs";
import HelpAndFeedback from "./components/HelpAndFeedback";
import Checkout from "./components/Checkout";
import AdminBootstrap from "./components/AdminBootstrap";

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
    <AuthProvider>
      <WishlistSync>
          {/* Navbar is always visible */}
          { location.pathname !== "/login" && location.pathname !== "/signup" && <Navbar /> }

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<div className="pt-[56px]"><ProductPage /></div>} />
            <Route path="/firsttimers" element={<FirstTimers />} />
            <Route path="/login" element={<LogIn />}/>
            <Route path="/signup" element={<SignUp />}/>
            <Route path="/profile" element={<UserProfile />}/>
            <Route path="/category/:slug" element={<CategoryPage />}/>
            <Route path="/faqs" element={<FAQs />}/>
            <Route path="/help" element={<HelpAndFeedback />}/>
            <Route path="/checkout" element={<Checkout />}/>
            <Route path="/admin/bootstrap" element={<div className="pt-[72px]"><AdminBootstrap /></div>} />
            <Route path="/admin" element={<div className="pt-[72px]"><AdminPage /></div>} />
          </Routes>

          {/* Cart drawer — always mounted so it can open from any page */}
          <Cart />
          {/* Wishlist drawer — always mounted so it can open from any page */}
          <Wishlist />
      </WishlistSync>
    </AuthProvider>
  );
}

export default App;
