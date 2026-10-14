// Social icon SVGs (inline, no external lib needed)
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.527 5.845L.057 23.25l5.551-1.453A11.932 11.932 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.792 9.792 0 0 1-5.004-1.373l-.358-.214-3.297.864.881-3.208-.234-.371A9.763 9.763 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer>
      {/* Main footer — green background */}
      <div className="bg-green-600 text-white py-10 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About us */}
          <div>
            <h3 className="font-semibold text-base mb-4">About us</h3>
            <ul className="space-y-2 text-sm">
              {["Our story", "Meet the team", "Careers", "Store locations"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:underline text-white/90 hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact us */}
          <div>
            <h3 className="font-semibold text-base mb-4">Contact us</h3>
            <div className="flex items-center gap-3 bg-white text-gray-800 rounded-full px-4 py-2 w-fit">
              <a href="#" aria-label="Instagram" className="hover:text-green-700 transition-colors">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="Twitter / X" className="hover:text-green-700 transition-colors">
                <TwitterIcon />
              </a>
              <a href="#" aria-label="WhatsApp" className="hover:text-green-700 transition-colors">
                <WhatsAppIcon />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-green-700 transition-colors">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-green-700 transition-colors">
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* Payment methods */}
          <div>
            <h3 className="font-semibold text-base mb-4">Ways You Can Pay</h3>
            <div className="flex items-center gap-3">
              {/* Visa */}
              <div className="bg-white rounded px-2 py-1 flex items-center justify-center h-8 w-14">
                <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Visa">
                  <text x="1" y="13" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1a1f71">VISA</text>
                </svg>
              </div>
              {/* Mastercard */}
              <div className="bg-white rounded px-1 py-1 flex items-center justify-center h-8 w-14">
                <svg viewBox="0 0 38 24" className="h-5 w-auto" aria-label="Mastercard">
                  <circle cx="13" cy="12" r="10" fill="#eb001b" />
                  <circle cx="25" cy="12" r="10" fill="#f79e1b" />
                  <path d="M19 5.3a10 10 0 0 1 0 13.4A10 10 0 0 1 19 5.3z" fill="#ff5f00" />
                </svg>
              </div>
              {/* PayPal */}
              <div className="bg-white rounded px-2 py-1 flex items-center justify-center h-8 w-16">
                <svg viewBox="0 0 60 16" className="h-4 w-auto" aria-label="PayPal">
                  <text x="1" y="12" fontFamily="Arial" fontWeight="bold" fontSize="11" fill="#003087">Pay</text>
                  <text x="22" y="12" fontFamily="Arial" fontWeight="bold" fontSize="11" fill="#009cde">Pal</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — dark green */}
      <div className="bg-green-900 text-white/80 text-xs py-3 px-8 text-center">
        © Greenrockoutdoorgear.com – All Rights Reserved 2023
      </div>
    </footer>
  );
}
