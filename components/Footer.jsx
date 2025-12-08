import { FiGlobe, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaInstagram, FaFacebook, FaXTwitter, FaLinkedin } from "react-icons/fa6";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Find Rooms", href: "/rooms" },
    { label: "Find Roommate", href: "/roommate" },
    { label: "Post Listing", href: "/post" },
    { label: "How It Works", href: "/how-it-works" },
  ];

  const companyLinks = [
    { label: "About Roomsafar", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <footer className="bg-slate-900 text-white pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand Block */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold">
                RS
              </div>
              <div>
                <h2 className="text-2xl font-bold">Roomsafar</h2>
                <p className="text-slate-400 text-sm mt-1">Find Your Perfect Stay</p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed">
              Roomsafar is a rental discovery platform helping students and working 
              professionals find safe, affordable, and verified rooms in Pune — 
              with transparent pricing and direct owner connections.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[FaInstagram, FaFacebook, FaXTwitter, FaLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social-link"
                  className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-blue-400 transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Explore</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-all"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Platform</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-all"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Contact</h3>
            <div className="space-y-4 text-slate-400">
              <p className="flex items-center gap-3">
                <FiMapPin className="text-blue-400" /> Pune, Maharashtra
              </p>
              <p className="flex items-center gap-3">
                <FiMail className="text-blue-400" />
                <a href="mailto:hello@roomsafar.com" className="hover:text-white">
                  hello@roomsafar.com
                </a>
              </p>
              <p className="flex items-center gap-3">
                <FiPhone className="text-blue-400" />
                <span>+91 98765 43210</span>
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm gap-4">
          <span>© {currentYear} Roomsafar. Built as a rental discovery platform.</span>

          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="/contact" className="hover:text-white">Support</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
