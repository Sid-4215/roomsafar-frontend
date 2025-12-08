import { useState, useContext, useCallback, useEffect, useRef } from "react";
import Script from "next/script";
import { AuthContext } from "../contexts/AuthContext";
import { authAPI } from "../services/api";

export default function LoginModal({ onClose }) {
  const { login } = useContext(AuthContext);

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const googleButtonInitialized = useRef(false);

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;

      if (mode === "login") {
        data = await authAPI.login(form.email, form.password);
      } else {
        data = await authAPI.register(form.name, form.email, form.password);
      }

      if (!data?.token) {
        throw new Error("No token received from server");
      }

      await login(data.token);
      onClose();
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = useCallback(
    async (response) => {
      try {
        setLoading(true);
        setError("");

        if (!response?.credential) {
          throw new Error("No credential received from Google");
        }

        console.log(
          "Google callback received, credential length:",
          response.credential.length
        );

        const data = await authAPI.googleLogin(response.credential);

        if (!data?.token) {
          throw new Error("No token received from server during Google login");
        }

        await login(data.token);
        onClose();
      } catch (err) {
        console.error("Google auth error:", err);
        setError(err.message || "Google sign-in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [login, onClose]
  );

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setError("");
  }, []);

  useEffect(() => {
    if (!googleLoaded || !GOOGLE_CLIENT_ID || googleButtonInitialized.current) {
      return;
    }

    const initGoogleSignIn = () => {
      try {
        if (!window.google?.accounts?.id) {
          console.warn("Google accounts API not available yet");
          return;
        }

        console.log("Initializing Google Sign-In with:", GOOGLE_CLIENT_ID);

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: "popup",
        });

        const div = document.getElementById("googleSignInDiv");
        if (div && div.childElementCount === 0) {
          console.log("Rendering Google Sign-In button...");
          window.google.accounts.id.renderButton(div, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: 350,
            text: "signin_with",
            shape: "pill",
            logo_alignment: "left",
          });
          googleButtonInitialized.current = true;
        }
      } catch (err) {
        console.error("Google Sign-In initialization error:", err);
      }
    };

    const tryInit = () => {
      if (window.google?.accounts?.id) {
        initGoogleSignIn();
      } else {
        setTimeout(tryInit, 100);
      }
    };

    tryInit();
  }, [googleLoaded, GOOGLE_CLIENT_ID, handleGoogleCallback]);

  useEffect(() => {
    return () => {
      googleButtonInitialized.current = false;
    };
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Google Sign-In script loaded successfully");
          setGoogleLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Google Sign-In script:", e);
          setError("Failed to load Google Sign-In. Please refresh the page.");
        }}
      />

      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-md rounded-2xl shadow-xl p-7 relative border"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl p-1 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="text-center mb-5">
            <h2 className="text-2xl font-semibold text-gray-900">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "login"
                ? "Login to continue exploring rooms"
                : "Sign up to start posting or saving rooms"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder={
                  mode === "login"
                    ? "Your password"
                    : "Create a strong password"
                }
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  Login
                </button>
              </>
            )}
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-xs text-gray-500">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div id="googleSignInDiv" className="flex justify-center min-h-[44px]" />

          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
}
