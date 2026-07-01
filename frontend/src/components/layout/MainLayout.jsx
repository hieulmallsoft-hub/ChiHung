import Footer from "./Footer";
import Navbar from "./Navbar";
import FloatingChatWidget from "../chat/FloatingChatWidget";
import { useAuth } from "../../hooks/useAuth";

export default function MainLayout({ children }) {
  const { isAuthenticated, hasRole } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <video
            className="absolute top-1/2 left-1/2 h-full w-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-100"
            src="/YTSave_Shorts_SUPER-GOAL-Chelsea-vs-Arsenal_Media_kAVCAP5D3cs_001_1080p.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
        <div className="absolute inset-0 bg-sky-950/40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-sky-900/40 to-slate-950/40"></div>
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_center,rgba(56,189,248,0.2)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <Navbar />
      <main className="relative mx-auto min-h-[calc(100vh-180px)] w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
      <Footer />
      {isAuthenticated && !hasRole("ROLE_ADMIN") && <FloatingChatWidget />}
    </div>
  );
}
