import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showModal, setShowModal] = useState(null);
  const [modalUsers, setModalUsers] = useState([]);

  useEffect(() => {
    async function fetchProfile() {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (!profileError) setProfile(profileData);

      const { data: storiesData } = await supabase
        .from("posts")
        .select("*, profiles(username, full_name)")
        .eq("author_id", id)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (storiesData) setStories(storiesData);

      const { count: fCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id);
      setFollowerCount(fCount || 0);

      const { count: fgCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", id);
      setFollowingCount(fgCount || 0);

      if (user && user.id !== id) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", id)
          .single();
        setFollowing(!!followData);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [id, user]);

  useEffect(() => {
    async function fetchModalUsers() {
      if (!showModal) return;
      setModalUsers([]);

      if (showModal === "followers") {
        const { data } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("following_id", id);

        if (data && data.length > 0) {
          const ids = data.map((f) => f.follower_id);
          const { data: users } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", ids);
          if (users) setModalUsers(users);
        }
      } else {
        const { data } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", id);

        if (data && data.length > 0) {
          const ids = data.map((f) => f.following_id);
          const { data: users } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", ids);
          if (users) setModalUsers(users);
        }
      }
    }
    fetchModalUsers();
  }, [showModal, id]);
   

  async function handleFollow() {
    if (!user) return alert("Login to follow writers.");
    if (following) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", id);
      setFollowing(false);
      setFollowerCount((prev) => prev - 1);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: id });
      setFollowing(true);
      setFollowerCount((prev) => prev + 1);
    }
  }

  if (loading) return <p className="p-10 text-gray-400">Loading...</p>;
  if (!profile) return <p className="p-10 text-gray-400">Profile not found.</p>;

  const isOwnProfile = user?.id === id;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-10 border-b pb-10">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-2xl font-bold text-gray-500 shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            profile.full_name?.charAt(0) || "?"
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-gray-500">@{profile.username}</p>
            </div>
            {!isOwnProfile && user && (
              <button
                onClick={handleFollow}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
                  following
                    ? "bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500"
                    : "bg-[#2c1a0e] text-[#faf7f2] border-[#2c1a0e] hover:bg-[#4a2e1a]"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
            )}
            {isOwnProfile && (
              <Link
                to="/settings"
                className="px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-600 hover:border-black transition"
              >
                Edit Profile
              </Link>
            )}
          </div>
          {profile.bio && (
            <p className="text-gray-600 mt-3 text-sm">{profile.bio}</p>
          )}
          <div className="flex items-center gap-6 mt-3">
            <button
              onClick={() => setShowModal("followers")}
              className="text-sm text-gray-500 hover:text-black transition"
            >
              <span className="font-semibold text-black">{followerCount}</span> Followers
            </button>
            <button
              onClick={() => setShowModal("following")}
              className="text-sm text-gray-500 hover:text-black transition"
            >
              <span className="font-semibold text-black">{followingCount}</span> Following
            </button>
            <p className="text-gray-400 text-xs">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Published Works */}
      <h2 className="text-xl font-bold mb-6">Published Works</h2>
      {stories.length === 0 ? (
        <p className="text-gray-400">No published works yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <Link
              to={`/story/${story.id}`}
              key={story.id}
              className="group rounded-xl overflow-hidden border border-[#e8dfd0] bg-[#faf7f2] hover:shadow-md transition"
            >
              <div className="w-full h-44 bg-[#fdf8f3] overflow-hidden flex items-center justify-center">
                {story.cover_image ? (
                  <img
                    src={story.cover_image}
                    alt={story.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    ["bg-[#c4a882]", "bg-[#8b6f47]", "bg-[#a08060]", "bg-[#6b4f2e]", "bg-[#d4b896]"][index % 5]
                  }`}>
                    <span className="text-white text-4xl opacity-30">✦</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-[#8b6f47] uppercase tracking-widest mb-1">{story.genre}</p>
                <h2 className="text-base font-semibold text-[#2c1a0e] mb-1 line-clamp-2 group-hover:underline">
                  {story.title}
                </h2>
                {story.subtitle && (
                  <p className="text-sm text-[#7a6050] line-clamp-2 mb-2">{story.subtitle}</p>
                )}
                <p className="text-xs text-[#8b6f47]">
                  {new Date(story.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Followers/Following Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{backgroundColor: "rgba(0,0,0,0.15)"}}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-[#2c1a0e] capitalize">{showModal}</h3>
              <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-black text-xl">✕</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {modalUsers.length === 0 ? (
                <p className="text-gray-400 text-sm p-5">No {showModal} yet.</p>
              ) : (
                modalUsers.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    onClick={() => setShowModal(null)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[#faf7f2] transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#e8dfd0] overflow-hidden flex items-center justify-center text-sm font-bold text-[#8b6f47] shrink-0">
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
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}