
const COMPANY_LINKS = [
  { href: "#about", label: "About us" },
  { href: "#blog", label: "Blog" },
  { href: "#contact", label: "Contact us" },
  { href: "#precios", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
];

const SUPPORT_LINKS = [
  { href: "#help", label: "Help center" },
  { href: "#terms", label: "Terms of service" },
  { href: "#legal", label: "Legal" },
  { href: "#privacy", label: "Privacy policy" },
  { href: "#status", label: "Status" },
];

const SOCIAL = [
  { href: "#", label: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948 2.597 7.617 6.417 11.45 14.004 11.717C15.336 28.667 15.75 28.68 19 28.68c3.259 0 3.668-.014 4.948-.072 7.618-2.597 11.45-6.418 11.718-14.005.058-1.335.072-1.746.072-4.948 0-3.259-.014-3.667-.072-4.947-2.597-7.617-6.417-11.45-14.004-11.717C24.664.273 24.25.26 21 .26c-3.259 0-3.667.014-4.948.072C8.333.272 2.695 2.69.273 7.052.014 8.333 0 8.741 0 12" },
  { href: "#", label: "Twitter", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { href: "#", label: "YouTube", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { href: "#", label: "LinkedIn", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
];

export function Footer() {
  return (
    <footer className="bg-gray-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">Copyright © 2020 TrackAid Ltd.</p>
            <p className="text-gray-400 text-sm">All rights reserved</p>
            <div className="flex gap-4 pt-2">
              {SOCIAL.map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <span className="w-6 h-6 block rounded-full bg-gray-700 hover:bg-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Stay up to date</h3>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2.5 rounded-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Email para suscripción"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary rounded-full hover:bg-primary-dark transition-colors"
                aria-label="Enviar"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
