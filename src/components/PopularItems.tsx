import { Link } from "react-router-dom";
import { PRODUCTS } from "../data/products";

function ImgPlaceholder() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-200">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.2}
        stroke="currentColor"
        className="w-10 h-10 text-gray-400"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    </div>
  );
}

export default function PopularItems() {
  return (
    <section className="w-full bg-gray-100 py-8 px-4 md:px-8" aria-label="Popular items">
      <h2 className="text-sm font-bold text-gray-800 mb-4">Popular Items</h2>
      <div className="grid grid-cols-5 gap-4">
        {PRODUCTS.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="block bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 aspect-square focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label={product.name}
          >
            {product.img ? (
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <ImgPlaceholder />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
