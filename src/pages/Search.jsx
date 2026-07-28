import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function Search() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchSuggestions() {
      if (!query.trim() || query.length < 1) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(5);

      if (data) {
        setSuggestions(data);
        setShowSuggestions(true);
      }
    }

    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setShowSuggestions(false);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20);

    if (!error) setResults(data);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-[#2c1a0e] mb-2">Search Writers</h1>
      <p className="text-[#8b6f47] mb-8">Find writers by name or username.</p>

      {/* Search Input */}
      <div className="relative mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name or username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="w-full border border-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-black transition"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e8dfd0] rounded-2xl shadow-lg overflow-hidden z-50">
                {suggestions.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf7f2] transition"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#e8dfd0] overflow-hidden flex items-center justify-center text-sm font-bold text-[#8b6f47] shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        u.full_name?.charAt(0) || "?"
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2c1a0e]">{u.full_name}</p>
                      <p className="text-xs text-[#8b6f47]">@{u.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="bg-[#2c1a0e] text-[#faf7f2] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#4a2e1a] transition"
          >
            Search
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-400">Searching...</p>}

      {!loading && searched && results.length === 0 && (
        <p className="text-gray-400">No writers found.</p>
      )}

      <div className="flex flex-col gap-4">
        {results.map((u) => (
          <Link
            key={u.id}
            to={`/profile/${u.id}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-[#e8dfd0] bg-[#faf7f2] hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-full bg-[#e8dfd0] overflow-hidden flex items-center justify-center text-lg font-bold text-[#8b6f47] shrink-0">
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                u.full_name?.charAt(0) || "?"
              )}
            </div>
            <div>
              <p className="font-semibold text-[#2c1a0e]">{u.full_name}</p>
              <p className="text-sm text-[#8b6f47]">@{u.username}</p>
              {u.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{u.bio}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}