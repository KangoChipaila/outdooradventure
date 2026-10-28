import type { Product } from "../types";

export type { Product } from "../types";

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Trail Running Shoe",
    brand: "Salomon",
    price: 2499.99,
    rating: 4.7,
    reviewCount: 214,
    description:
      "Lightweight trail running shoe engineered for technical terrain. Features a Contagrip® outsole for maximum grip, a protective toe cap, and a cushioned midsole that absorbs trail shock mile after mile.",
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
    colors: ["Olive", "Black", "Grey"],
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80",
    ],
    category: "Shoes",
  },
  {
    id: 2,
    name: "Polarised Sunglasses",
    brand: "Julbo",
    price: 1249.50,
    rating: 4.5,
    reviewCount: 87,
    description:
      "High-performance polarised sunglasses with UV400 protection. Wraparound frame design reduces wind glare. Ideal for hiking, cycling, and water sports.",
    sizes: ["One Size"],
    colors: ["Teal / Black", "Smoke / Grey", "Orange / Black"],
    img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
    ],
    category: "Accessories",
  },
  {
    id: 3,
    name: "Hardshell Jacket",
    brand: "Arc'teryx",
    price: 4199.00,
    rating: 4.9,
    reviewCount: 341,
    description:
      "3-layer GORE-TEX® Pro hardshell offering waterproof, windproof, and breathable protection. Helmet-compatible hood, pit-zip vents, and reinforced shoulders for alpine demands.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black / Lime", "Navy", "Granite"],
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=600&q=80",
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80",
    ],
    category: "Clothing",
  },
  {
    id: 4,
    name: "Trekking Poles",
    brand: "Black Diamond",
    price: 1899.00,
    rating: 4.6,
    reviewCount: 128,
    description:
      "Collapsible aluminium trekking poles with FlickLock® Pro adjustment, cork grips, and interchangeable baskets. Folds down to 38 cm for easy pack storage.",
    sizes: ["One Size"],
    colors: ["Silver", "Carbon Black"],
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80",
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=80",
    ],
    category: "Hiking",
  },
  {
    id: 5,
    name: "TC Pro Climbing Shoe",
    brand: "La Sportiva",
    price: 4588.99,
    rating: 4.6,
    reviewCount: 109,
    description:
      "The TC Pro is a high-performance climbing shoe designed for crack climbing and all-day wear on big walls. Lace-up closure, Vibram® XS Edge sole, and a stiff last for maximum precision on small holds.",
    sizes: ["5/38", "6/39.5", "7/41", "8/42", "9/43", "10/44.5", "11/46", "12/47", "13/48"],
    colors: ["Olive / Black"],
    img: "https://images.unsplash.com/photo-1508629175061-7e894b5e5c22?w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1508629175061-7e894b5e5c22?w=600&q=80",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
    ],
    category: "Shoes",
  },
  { id: 6,  name: "Sleeping Bag",      brand: "Rab",         price: 3299.00, rating: 4.4, reviewCount: 66,  description: "Down sleeping bag rated to -10°C. Hydrophobic 800 fill power down, YKK zip, and contoured hood. Packs to grapefruit size.", sizes: ["Regular", "Long"], colors: ["Ebony", "Ink Blue"],        img: "", gallery: [], category: "Camping" },
  { id: 7,  name: "Headlamp",           brand: "Petzl",       price: 699.00,  rating: 4.8, reviewCount: 203, description: "Compact 450-lumen reactive headlamp with REACTIVE LIGHTING® technology that automatically adjusts brightness to your needs.", sizes: ["One Size"], colors: ["Black", "Red"],             img: "", gallery: [], category: "Lighting" },
  { id: 8,  name: "Hydration Pack",     brand: "Osprey",      price: 2149.00, rating: 4.7, reviewCount: 155, description: "10 L hydration pack with 2.5 L reservoir, integrated rain cover, and ventilated back panel. Ideal for half-day trail runs.", sizes: ["One Size"], colors: ["Starry Night Blue", "Lime"], img: "", gallery: [], category: "Bags" },
  { id: 9,  name: "Carabiner Set",      brand: "Mammut",      price: 549.00,  rating: 4.9, reviewCount: 412, description: "Set of 4 UIAA-certified screwgate carabiners. Keylock nose, 25 kN gate-closed strength.", sizes: ["One Size"], colors: ["Silver"],                       img: "", gallery: [], category: "Climbing" },
  { id: 10, name: "Camp Stove",         brand: "MSR",         price: 1399.00, rating: 4.5, reviewCount: 88,  description: "Ultralight canister stove weighing just 73 g. Folds to pocket size, boils 1 L in 3.5 minutes. Includes fold-out pot supports.", sizes: ["One Size"], colors: ["Silver / Red"],             img: "", gallery: [], category: "Camping" },
];
