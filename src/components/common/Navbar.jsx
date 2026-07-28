import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabase";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchAvatar() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, username")
        .eq("id", user.id)
        .single();
      if (data) setAvatar(data);
    }
    fetchAvatar();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    navigate("/");
  }

  return (
    <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Storiax logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-bold tracking-tight">Storiax</span>
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/" className="text-gray-600 hover:text-black transition">Home</Link>
        <Link to="/explore" className="text-gray-600 hover:text-black transition">Explore</Link>

        {user ? (
          <>
            <Link to="/editor" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition">
              Write
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#e8dfd0] overflow-hidden flex items-center justify-center text-sm font-bold text-[#8b6f47] border-2 border-transparent hover:border-[#c4a882] transition"
              >
                {avatar?.avatar_url ? (
                  <img src={avatar.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{avatar?.username?.charAt(0)?.toUpperCase() || "?"}</span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">@{avatar?.username}</p>
                  </div>
                  <Link to={`/profile/${user.id}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-[#faf7f2] transition">
                    👤 My Profile
                  </Link>
                  <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-[#faf7f2] transition">
                    📊 Dashboard
                  </Link>
                  <Link to="/bookmarks" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-[#faf7f2] transition">
                    🔖 Bookmarks
                  </Link>
                  <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-[#faf7f2] transition">
                    ⚙️ Settings
                  </Link>
                  <div className="border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition">
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-black transition">Login</Link>
            <Link to="/register" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}