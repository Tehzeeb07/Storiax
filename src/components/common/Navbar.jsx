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
    <nav className="sticky top-0 z-40 border-b border-[#D6CABB] px-6 py-4 flex items-center justify-between theme-panel">
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Storiax logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-bold tracking-tight text-[#221A14]">Storiax</span>
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/" className="text-[#6A4A50] hover:text-[#4B1F24] transition">Home</Link>
        <Link to="/explore" className="text-[#6A4A50] hover:text-[#4B1F24] transition">Explore</Link>

        {user ? (
          <>
            <Link to="/editor" className="bg-[#4B1F24] text-white px-4 py-2 rounded-full hover:bg-[#381015] transition shadow-sm">
              Write
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#E9E4DA] overflow-hidden flex items-center justify-center text-sm font-bold text-[#6A4A50] border-2 border-transparent hover:border-[#6A4A50] transition"
              >
                {avatar?.avatar_url ? (
                  <img src={avatar.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{avatar?.username?.charAt(0)?.toUpperCase() || "?"}</span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 theme-panel rounded-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#D6CABB]">
                    <p className="text-sm font-medium text-[#221A14]">@{avatar?.username}</p>
                  </div>
                  <Link to={`/profile/${user.id}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-[#221A14] hover:bg-[#FBF8F3] transition">
                    My Profile
                  </Link>
                  <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-[#221A14] hover:bg-[#FBF8F3] transition">
                    Dashboard
                  </Link>
                  <Link to="/bookmarks" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-[#221A14] hover:bg-[#FBF8F3] transition">
                    Bookmarks
                  </Link>
                  <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-[#221A14] hover:bg-[#FBF8F3] transition">
                    Settings
                  </Link>
                  <div className="border-t border-[#D6CABB]">
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[#4B1F24] hover:bg-[#F3E7E5] transition">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-[#6A4A50] hover:text-[#4B1F24] transition">Login</Link>
            <Link to="/register" className="bg-[#4B1F24] text-white px-4 py-2 rounded-full hover:bg-[#381015] transition shadow-sm">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
