import "@/styles/globals.css";
import { Inter } from "next/font/google";
import AuthProvider from "../contexts/AuthContext";
import ToastProvider from "../components/Toaster";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className={inter.className}>
        <Component {...pageProps} />
        <ToastProvider />
      </div>
    </AuthProvider>
  );
}