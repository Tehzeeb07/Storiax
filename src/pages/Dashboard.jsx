import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Pencil,
  Trash2,
  Search,
  Eye,
  Clock,
  BookOpen,
  Sparkles,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

const COVER_COLORS = [
  "from-rose-100 to-rose-200",
  "from-amber-100 to-amber-200",
  "from-emerald-100 to-emerald-200",
  "from-sky-100 to-sky-200",
  "from-violet-100 to-violet-200",
  "from-teal-100 to-teal-200",
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function getReadingTime(text) {
  if (!text) return null;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return null;
  return Math.max(1, Math.round(words / 200));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function toDateKey(date) {
  return date.toISOString().split("T")[0];
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-stone-200 overflow-hidden animate-pulse bg-white">
      <div className="h-32 bg-stone-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-stone-200 rounded w-3/4" />
        <div className="h-4 bg-stone-200 rounded w-full" />
        <div className="h-4 bg-stone-200 rounded w-5/6" />
        <div className="h-3 bg-stone-200 rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-stone-200 rounded-2xl px-4 py-3">
      <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-xs text-stone-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

function PublishingCalendar({ allPosts, onSelectDate, selectedDate }) {
  const [viewDate, setViewDate] = useState(new Date());

  const postsByDate = useMemo(() => {
    const map = {};
    allPosts.forEach((p) => {
      if (!p.created_at) return;
      const key = toDateKey(new Date(p.created_at));
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [allPosts]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayKey = toDateKey(new Date());
  const monthLabel = viewDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-stone-600" />
        </div>
        <h3 className="text-sm font-bold font-serif text-stone-900">
          Publishing Calendar
        </h3>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 rounded-full hover:bg-stone-100 transition"
        >
          <ChevronLeft className="w-4 h-4 text-stone-500" />
        </button>
        <span className="text-sm font-medium text-stone-700">{monthLabel}</span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 rounded-full hover:bg-stone-100 transition"
        >
          <ChevronRight className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-stone-400">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const cellDate = new Date(year, month, day);
          const key = toDateKey(cellDate);
          const hasPosts = !!postsByDate[key];
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;

          return (
            <button
              key={i}
              onClick={() => onSelectDate(isSelected ? null : key)}
              className={`relative h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs transition ${
                isSelected
                  ? "bg-stone-900 text-white font-semibold"
                  : isToday
                  ? "bg-rose-100 text-stone-900 font-semibold"
                  : "hover:bg-stone-100 text-stone-600"
              }`}
            >
              {day}
              {hasPosts && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Activity list */}
      <div className="mt-5 pt-4 border-t border-stone-100 space-y-2 max-h-52 overflow-y-auto">
        {(selectedDate ? postsByDate[selectedDate] || [] : allPosts.slice(0, 5)).length ===
        0 ? (
          <p className="text-xs text-stone-400 text-center py-2">
            No stories on this day.
          </p>
        ) : (
          (selectedDate ? postsByDate[selectedDate] : allPosts.slice(0, 5)).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  p.status === "published" ? "bg-emerald-500" : "bg-stone-400"
                }`}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-800 truncate">
                  {p.title}
                </p>
                <p className="text-[10px] text-stone-400">
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [published, setPublished] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("published");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setPublished(data.filter((p) => p.status === "published"));
        setDrafts(data.filter((p) => p.status === "draft"));
      }
      setLoading(false);
    }

    fetchPosts();
  }, [user]);

  async function handleDelete(id) {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (!confirm) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) {
      setPublished((prev) => prev.filter((p) => p.id !== id));
      setDrafts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const allPosts = useMemo(() => [...published, ...drafts], [published, drafts]);

  const rawPosts = activeTab === "published" ? published : drafts;

  const posts = useMemo(() => {
    let result = rawPosts;

    if (selectedDate) {
      result = result.filter(
        (p) => p.created_at && toDateKey(new Date(p.created_at)) === selectedDate
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "az") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

    return result;
  }, [rawPosts, searchQuery, sortBy, selectedDate]);

  const totalViews = allPosts.reduce(
    (sum, p) => sum + (typeof p.views === "number" ? p.views : 0),
    0
  );

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{getGreeting()}, {firstName}</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-6">
            Your Dashboard
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatPill icon={BookOpen} label="Published" value={published.length} />
            <StatPill icon={FileText} label="Drafts" value={drafts.length} />
            <StatPill
              icon={TrendingUp}
              label="Total stories"
              value={published.length + drafts.length}
            />
            <StatPill icon={Eye} label="Total views" value={totalViews} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Stories panel */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-stone-600" />
                </div>
                <h2 className="text-lg font-serif font-bold text-stone-900">
                  Your Stories
                </h2>
              </div>
              <Link
                to="/editor"
                className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-stone-800 transition text-center"
              >
                + New Story
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-stone-200 mb-6">
              <button
                onClick={() => setActiveTab("published")}
                className={`pb-3 text-sm font-medium transition ${
                  activeTab === "published"
                    ? "border-b-2 border-stone-900 text-stone-900"
                    : "text-stone-400 hover:text-stone-900"
                }`}
              >
                Published ({published.length})
              </button>
              <button
                onClick={() => setActiveTab("drafts")}
                className={`pb-3 text-sm font-medium transition ${
                  activeTab === "drafts"
                    ? "border-b-2 border-stone-900 text-stone-900"
                    : "text-stone-400 hover:text-stone-900"
                }`}
              >
                Drafts ({drafts.length})
              </button>
            </div>

            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your stories..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-stone-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="az">Title A–Z</option>
              </select>
            </div>

            {selectedDate && (
              <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-full px-4 py-2 mb-6 text-xs text-stone-600">
                <span>
                  Showing stories from{" "}
                  <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
                </span>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-rose-600 font-medium hover:underline"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Posts */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-stone-200 rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-stone-400" />
                </div>
                <p className="text-stone-500 mb-4">
                  {searchQuery || selectedDate
                    ? "No stories match your filters."
                    : `No ${activeTab} stories yet.`}
                </p>
                {!searchQuery && !selectedDate && (
                  <Link
                    to="/editor"
                    className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-stone-800 transition"
                  >
                    Write your first story
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {posts.map((post, index) => {
                  const readingTime = getReadingTime(post.content);
                  const coverColor = COVER_COLORS[index % COVER_COLORS.length];

                  return (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/story/${post.id}`)}
                      className="group flex flex-col rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition cursor-pointer"
                    >
                      {post.cover_url ? (
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="h-28 w-full object-cover"
                        />
                      ) : (
                        <div
                          className={`h-28 w-full bg-gradient-to-br ${coverColor} flex items-center justify-center`}
                        >
                          <span className="text-2xl font-bold text-black/30 font-serif">
                            {post.title?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col justify-between flex-1 p-4">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                post.status === "published"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-stone-200 text-stone-600"
                              }`}
                            >
                              {post.status === "published" ? "Published" : "Draft"}
                            </span>
                            {readingTime && (
                              <span className="flex items-center gap-1 text-xs text-stone-400">
                                <Clock className="w-3 h-3" />
                                {readingTime} min
                              </span>
                            )}
                          </div>
                          <h2 className="font-bold text-lg font-serif line-clamp-2 text-stone-900">
                            {post.title}
                          </h2>
                          <p className="text-stone-500 text-sm mt-1 line-clamp-2">
                            {post.subtitle}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-stone-400">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2 shrink-0">
                            <Link
                              to={`/editor/${post.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-full text-stone-500 hover:text-black hover:bg-stone-200 transition"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(post.id);
                              }}
                              className="p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar sidebar */}
          <div className="lg:col-span-1">
            <PublishingCalendar
              allPosts={allPosts}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}