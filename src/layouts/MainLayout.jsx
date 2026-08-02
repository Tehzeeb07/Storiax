import Navbar from "../components/common/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen text-[#221A14] bg-transparent relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_12%,_rgba(139,144,127,0.22),_transparent_18%),radial-gradient(circle_at_88%_14%,_rgba(106,74,80,0.18),_transparent_20%),radial-gradient(circle_at_18%_78%,_rgba(75,90,58,0.18),_transparent_22%),radial-gradient(circle_at_82%_72%,_rgba(75,31,36,0.16),_transparent_20%),linear-gradient(180deg,_rgba(245,240,232,0.34),_rgba(245,240,232,0.12))]" />
      <Navbar />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
