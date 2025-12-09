import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import LoginModal from "./LoginModal";
import { FiMenu, FiX, FiPlus, FiUser, FiList, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/router";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Find Rooms", href: "/rooms" },
    { label: "Find Roommate", href: "/roommate" }, // NEW PAGE
    { label: "Post Listing", href: "/post" },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-md"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <a href="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
              RS
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">Roomsafar</p>
              <p className="text-xs text-slate-500 -mt-1">
                Find Your Perfect Stay
              </p>
            </div>
          </a>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  router.pathname === item.href
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-4 relative">

            {/* Not Logged In */}
            {!user && (
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
              >
                Login / Signup
              </button>
            )}

            {/* Logged-In User */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdown(!dropdown)}
                  className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-semibold text-lg shadow cursor-pointer hover:opacity-90 transition"
                >
                  {userInitial}
                </button>

                {dropdown && (
                  <div className="
                    absolute right-0 mt-3 w-52 
                    bg-white shadow-xl rounded-xl border border-slate-200 
                    animate-[fadeIn_0.2s_ease-out]
                  ">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>

                    {/* MENU OPTIONS */}
                    <div className="py-2">
                      <a
                        href="/my-rooms"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                      >
                        <FiList size={16} /> My Listings
                      </a>

                      <a
                        href="/post"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                      >
                        <FiPlus size={16} /> Post a Listing
                      </a>

                      {/* ❌ Removed My Profile option */}

                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <FiLogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
          >
            {mobileMenu ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-200 shadow-inner">
            <div className="px-4 py-3 space-y-1">

              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium ${
                    router.pathname === item.href
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-700 hover:bg-slate-100 hover:text-indigo-600"
                  }`}
                >
                  {item.label}
                </a>
              ))}

              {/* Mobile Login */}
              {!user && (
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setMobileMenu(false);
                  }}
                  className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white mt-3"
                >
                  Login / Signup
                </button>
              )}

              {/* Mobile Logged-In */}
              {user && (
                <>
                  <a
                    href="/my-rooms"
                    onClick={() => setMobileMenu(false)}
                    className="block px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-100"
                  >
                    My Listings
                  </a>

                  <a
                    href="/post"
                    onClick={() => setMobileMenu(false)}
                    className="block px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Post a Listing
                  </a>

                  {/* ❌ Removed My Profile */}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenu(false);
                    }}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-sm font-semibold hover:bg-red-100"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
