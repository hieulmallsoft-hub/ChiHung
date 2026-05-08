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
          <iframe
            className="absolute top-1/2 left-1/2 min-w-[100vw] min-h-[100vh] w-[177.77vh] h-[56.25vw] -translate-x-1/2 -translate-y-1/2 opacity-100 pointer-events-none"
            src="https://www.youtube.com/embed/UNc8GUGmN70?autoplay=1&mute=1&loop=1&playlist=UNc8GUGmN70&controls=0&showinfo=0&rel=0&modestbranding=1&vq=hd1080"
            title="Arsenal Goal Background"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30"></div>
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:24px_24px]" />
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
