import Footer from "./Footer";
import Navbar from "./Navbar";
import FloatingChatWidget from "../chat/FloatingChatWidget";
import { useAuth } from "../../hooks/useAuth";

export default function MainLayout({ children }) {
  const { isAuthenticated, hasRole } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(244,63,94,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.08)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-drift rounded-full bg-primary-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-1/3 h-80 w-80 animate-drift rounded-full bg-primary-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[30%] h-[360px] w-[360px] animate-drift rounded-full bg-rose-300/30 blur-3xl" />

      <Navbar />
      <main className="relative mx-auto min-h-[calc(100vh-180px)] w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
      <Footer />
      {isAuthenticated && !hasRole("ROLE_ADMIN") && <FloatingChatWidget />}
    </div>
  );
}
