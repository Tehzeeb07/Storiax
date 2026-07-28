import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [published, setPublished] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("published");

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

  const posts = activeTab === "published" ? published : drafts;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          to="/editor"
          className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800 transition"
        >
          + New Story
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-8">
        <button
          onClick={() => setActiveTab("published")}
          className={`pb-3 text-sm font-medium transition ${
            activeTab === "published"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-black"
          }`}
        >
          Published ({published.length})
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`pb-3 text-sm font-medium transition ${
            activeTab === "drafts"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-black"
          }`}
        >
          Drafts ({drafts.length})
        </button>
      </div>

      {/* Posts */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-400">No {activeTab} posts yet.</p>
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post.id} className="border-b border-gray-200 py-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg">{post.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{post.subtitle}</p>
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3 text-sm shrink-0">
                <Link
                  to={`/editor/${post.id}`}
                  className="text-gray-600 hover:text-black transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}