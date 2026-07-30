import "../styles/theme.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublishedStories } from "../services/postService";
import { useAuth } from "../contexts/AuthContext";

const GENRES = ["Romance", "Fantasy", "Poetry", "Horror", "Mystery", "Fiction"];

export default function Home() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStories() {
      const { data, error } = await getPublishedStories();
      if (!error && data) setStories(data);
      setLoading(false);
    }
    fetchStories();
  }, []);

  const featured = stories[0];
  const latest = useMemo(() => stories.slice(1, 7), [stories]);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/explore?search=${encodeURIComponent(searchTerm)}`);
  }

  return (
    <div className="relative overflow-hidden">
      <section className="relative px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(139,144,127,0.18),_transparent_34%),radial-gradient(circle_at_80%_18%,_rgba(106,74,80,0.14),_transparent_26%),linear-gradient(180deg,_rgba(245,240,232,0.94)_0%,_rgba(245,240,232,0.72)_100%)]" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[#6A4A50] mb-5">Storiax books and stories</p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] text-[#221A14] mb-6">
              Stories with
              <br />
              atmosphere.
            </h1>
            <p className="text-base md:text-lg text-[#4A2E1F] max-w-xl leading-7 mb-8">
              Discover novels, short fiction, and reader favorites in a calm editorial space inspired by old-world book jackets and soft botanical textures.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stories, genres, writers..."
                className="flex-1 rounded-full border border-[#D6CABB] bg-white/75 px-5 py-3 text-sm text-[#221A14] placeholder:text-[#8B907F] outline-none focus:border-[#6A4A50] focus:ring-4 focus:ring-[#6A4A50]/10"
              />
              <button className="rounded-full bg-[#4B1F24] px-6 py-3 text-sm font-medium text-white hover:bg-[#381015] transition shadow-sm">
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => navigate(`/explore?category=${genre}`)}
                  className="rounded-full border border-[#D6CABB] bg-white/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#4A2E1F] hover:bg-[#E9E4DA] transition"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,_rgba(75,90,58,0.18),_transparent_36%),radial-gradient(circle_at_80%_70%,_rgba(75,31,36,0.16),_transparent_30%),linear-gradient(180deg,_rgba(75,90,58,0.10),_rgba(106,74,80,0.08))] blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="col-span-1 row-span-2 rounded-[2rem] overflow-hidden border border-[#D6CABB] bg-[#FBF8F3] shadow-[0_25px_70px_rgba(34,26,20,0.12)]">
                <div className="h-full min-h-[420px] bg-[radial-gradient(circle_at_top,_rgba(139,144,127,0.22),_transparent_36%),linear-gradient(180deg,_rgba(245,240,232,0.9),_rgba(75,90,58,0.2))] p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#6A4A50]">Featured</p>
                    <p className="mt-3 text-3xl font-serif text-[#221A14] leading-tight">
                      {featured ? featured.title : "A quiet, haunting place for readers."}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-white/70 p-4 backdrop-blur-sm border border-white/60">
                    <p className="text-sm text-[#4A2E1F] mb-1">
                      {featured?.subtitle || "A world of layered stories and beautifully written chapters."}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8B907F]">Botanical editorial mood</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] overflow-hidden border border-[#D6CABB] bg-[#FBF8F3] shadow-md">
                <div className="h-48 bg-[linear-gradient(135deg,_rgba(75,90,58,0.28),_rgba(106,74,80,0.22),_rgba(75,31,36,0.24))] p-5 flex flex-col justify-end">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/85">New release</p>
                  <p className="mt-2 font-serif text-2xl text-white leading-tight">Romantic, moody, timeless.</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] overflow-hidden border border-[#D6CABB] bg-[#FBF8F3] shadow-md p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-[#6A4A50] mb-3">Reader favorites</p>
                <p className="font-serif text-2xl text-[#221A14] leading-tight">Elegant covers, intimate stories, thoughtful pacing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#6A4A50] mb-2">Recent releases</p>
              <h2 className="font-serif text-3xl md:text-4xl text-[#221A14]">Fresh stories on the shelf</h2>
            </div>
            <Link to="/explore" className="text-sm font-medium text-[#4B1F24] hover:text-[#381015]">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="text-[#8B907F]">Loading stories...</p>
          ) : latest.length === 0 ? (
            <p className="text-[#8B907F]">No stories published yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.map((story) => (
                <Link
                  key={story.id}
                  to={`/story/${story.id}`}
                  className="group rounded-[1.5rem] overflow-hidden border border-[#D6CABB] bg-[#FBF8F3] shadow-sm hover:shadow-[0_18px_45px_rgba(34,26,20,0.14)] transition"
                >
                  <div className="aspect-[4/5] bg-[linear-gradient(135deg,_rgba(75,90,58,0.16),_rgba(106,74,80,0.14),_rgba(75,31,36,0.18))] overflow-hidden">
                    <img
                      src={story.cover_image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=900"}
                      alt={story.title}
                      className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#6A4A50] mb-2">{story.genre || "Fiction"}</p>
                    <h3 className="font-serif text-2xl text-[#221A14] leading-tight mb-2">{story.title}</h3>
                    {story.subtitle && <p className="text-sm text-[#4A2E1F] line-clamp-2">{story.subtitle}</p>}
                    <p className="mt-4 text-xs text-[#8B907F]">Read the latest chapter in a calmer, more atmospheric layout.</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div className="rounded-[2rem] border border-[#D6CABB] bg-[rgba(233,228,218,0.72)] p-8 shadow-[0_20px_60px_rgba(34,26,20,0.08)]">
            <p className="text-xs uppercase tracking-[0.35em] text-[#6A4A50] mb-3">Must-read stories</p>
            <h2 className="font-serif text-3xl text-[#221A14] leading-tight mb-3">Handpicked community favorites you won't put down.</h2>
            <p className="text-[#4A2E1F] text-sm leading-7">
              The old homepage energy comes back here with a stronger visual rhythm, but the current theme stays intact.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stories.slice(0, 6).map((story) => (
              <Link
                key={story.id}
                to={`/story/${story.id}`}
                className="group rounded-[1.25rem] overflow-hidden border border-[#D6CABB] bg-[#FBF8F3] shadow-sm hover:shadow-[0_18px_45px_rgba(34,26,20,0.14)] transition"
              >
                <div className="aspect-[2/3] overflow-hidden bg-[linear-gradient(135deg,_rgba(75,90,58,0.16),_rgba(106,74,80,0.14),_rgba(75,31,36,0.18))]">
                  <img
                    src={story.cover_image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=900"}
                    alt={story.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#6A4A50] mb-1">{story.genre || "Fiction"}</p>
                  <p className="font-serif text-lg text-[#221A14] leading-tight">{story.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_0.95fr] gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#6A4A50] mb-3">All the genres</p>
            <h2 className="font-serif text-3xl md:text-5xl text-[#221A14] leading-tight mb-4">
              All the moods. All you.
            </h2>
            <p className="text-[#4A2E1F] text-sm md:text-base max-w-xl leading-7 mb-6">
              Search by title, browse by genre, and jump into whatever fits your mood today.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4 max-w-xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or genre..."
                className="flex-1 rounded-full border border-[#D6CABB] bg-white/70 px-5 py-3 text-sm text-[#221A14] placeholder:text-[#8B907F] outline-none focus:border-[#6A4A50] focus:ring-4 focus:ring-[#6A4A50]/10"
              />
              <button type="submit" className="rounded-full bg-[#4B1F24] px-6 py-3 text-sm font-medium text-white hover:bg-[#381015] transition shadow-sm">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => navigate(`/explore?category=${genre}`)}
                  className="rounded-full border border-[#D6CABB] bg-white/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#4A2E1F] hover:bg-[#E9E4DA] transition"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#D6CABB] bg-[#FBF8F3] overflow-hidden shadow-[0_20px_60px_rgba(34,26,20,0.10)]">
            <div className="h-72 bg-[linear-gradient(135deg,_rgba(75,90,58,0.22),_rgba(106,74,80,0.2),_rgba(75,31,36,0.24))] flex items-center justify-center p-8 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/80 mb-3">Explore Unlimited Worlds</p>
                <h3 className="font-serif text-3xl text-white leading-tight mb-3">Discover hidden gems written by passionate creators worldwide.</h3>
                <p className="text-white/75 text-sm leading-6">A cleaner browsing experience with the same rich theme behind it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto rounded-[2rem] border border-[#D6CABB] bg-[rgba(233,228,218,0.72)] p-8 md:p-12 shadow-[0_20px_60px_rgba(34,26,20,0.08)]">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#6A4A50] mb-3">Your book club, but bigger</p>
              <h2 className="font-serif text-3xl md:text-5xl text-[#221A14] leading-tight mb-4">
                Read, react, and connect with writers and readers.
              </h2>
              <p className="text-[#4A2E1F] max-w-2xl leading-7">
                The homepage now keeps the richer feature flow from the older version, but it stays inside the current dark editorial theme instead of swapping styles.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button onClick={() => navigate("/explore")} className="rounded-full bg-[#4B1F24] px-6 py-3 text-sm font-medium text-white hover:bg-[#381015] transition shadow-sm">
                Explore Stories
              </button>
              {!user && (
                <button onClick={() => navigate("/register")} className="rounded-full border border-[#6A4A50] px-6 py-3 text-sm font-medium text-[#4B1F24] hover:bg-white/60 transition">
                  Join Storiax
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {!user && (
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto text-center rounded-[2rem] border border-[#D6CABB] bg-[rgba(245,240,232,0.88)] p-10 shadow-[0_20px_60px_rgba(34,26,20,0.08)]">
            <h2 className="font-serif text-3xl md:text-4xl text-[#221A14] mb-3">Your next favorite story starts here</h2>
            <p className="text-[#4A2E1F] mb-6">Join Storiax and carry your favorite stories and community with you.</p>
            <button
              className="rounded-full bg-[#4B1F24] px-8 py-3 text-sm font-medium text-white hover:bg-[#381015] transition shadow-sm"
              onClick={() => navigate("/register")}
            >
              Join Storiax Free
            </button>
          </div>
        </section>
      )}

      <footer className="bg-[#221A14]/95 px-6 py-12 text-[#D6CABB]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 text-sm mb-6">
          <Link to="/explore" className="hover:text-white transition">Explore</Link>
          <Link to="/editor" className="hover:text-white transition">Write</Link>
          <Link to="/about" className="hover:text-white transition">About</Link>
          <Link to="/login" className="hover:text-white transition">Sign In</Link>
        </div>
        <p className="text-center text-xs text-[#8B907F]">© 2026 Storiax. Built for passionate readers & writers.</p>
      </footer>
    </div>
  );
}