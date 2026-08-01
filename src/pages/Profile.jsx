import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Users, UserPlus, BookOpen, Eye, Calendar } from "lucide-react";

function StatPill({ icon: Icon, label, value, onClick }) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className="flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-[#D6CABB]/20 rounded-2xl px-4 py-3 text-left hover:border-[#E9E4DA]/40 transition"
    >
      <div className="w-9 h-9 rounded-full bg-[#4B1F24] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none text-[#F5F0E8]">{value}</p>
        <p className="text-xs text-[#D6CABB] mt-1">{label}</p>
      </div>
    </Wrapper>
  );
}

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

        if (data?.length) {
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

        if (data?.length) {
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

  if (loading) return <p className="p-10 text-[#D6CABB]">Loading...</p>;
  if (!profile) return <p className="p-10 text-[#D6CABB]">Profile not found.</p>;

  const isOwnProfile = user?.id === id;
  const totalViews = stories.reduce(
    (sum, s) => sum + (typeof s.views === "number" ? s.views : 0),
    0
  );

  return (
    <div
      className="min-h-screen px-6 py-12 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(34,26,20,0.35), rgba(34,26,20,0.92)), url('/cozy.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="theme-panel rounded-[2rem] p-6 md:p-8 mb-10">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-[#E9E4DA] overflow-hidden flex items-center justify-center text-3xl font-bold text-[#4B1F24] shrink-0 border border-[#D6CABB]/20">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                profile.full_name?.charAt(0) || "?"
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-[#F5F0E8]">{profile.full_name}</h1>
                  <p className="text-[#D6CABB]">@{profile.username}</p>
                </div>

                {!isOwnProfile && user && (
                  <button
                    onClick={handleFollow}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
                      following
                        ? "bg-white/10 border-[#D6CABB]/30 text-[#F5F0E8] hover:border-[#F5F0E8]"
                        : "bg-[#4B1F24] text-white border-[#4B1F24] hover:bg-[#381015]"
                    }`}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                )}

                {isOwnProfile && (
                  <Link
                    to="/settings"
                    className="px-5 py-2 rounded-full text-sm font-medium border border-[#D6CABB]/30 text-[#F5F0E8] hover:border-[#F5F0E8] transition"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>

              {profile.bio && <p className="text-[#E9E4DA] mt-3 text-sm max-w-2xl">{profile.bio}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <StatPill
              icon={Users}
              label="Followers"
              value={followerCount}
              onClick={() => setShowModal("followers")}
            />
            <StatPill
              icon={UserPlus}
              label="Following"
              value={followingCount}
              onClick={() => setShowModal("following")}
            />
            <StatPill icon={BookOpen} label="Published" value={stories.length} />
            <StatPill icon={Eye} label="Total views" value={totalViews} />
          </div>

          <p className="flex items-center gap-1.5 text-[#D6CABB] text-xs mt-5">
            <Calendar className="w-3.5 h-3.5" />
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="theme-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-[#E9E4DA] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#4B1F24]" />
            </div>
            <h2 className="text-lg font-serif font-bold text-[#F5F0E8]">Published Works</h2>
          </div>

          {stories.length === 0 ? (
            <p className="text-[#D6CABB]">No published works yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {stories.map((story, index) => (
                <Link
                  to={`/story/${story.id}`}
                  key={story.id}
                  className="group rounded-[1.5rem] overflow-hidden border border-[#D6CABB]/20 bg-white/5 hover:shadow-[0_18px_45px_rgba(34,26,20,0.14)] transition"
                >
                  <div className="w-full h-44 bg-[#221A14]/35 overflow-hidden flex items-center justify-center">
                    {story.cover_image ? (
                      <img
                        src={story.cover_image}
                        alt={story.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${["bg-[#4B5A3A]", "bg-[#8B907F]", "bg-[#6A4A50]", "bg-[#4B1F24]", "bg-[#4A2E1F]"][index % 5]}`}>
                        <span className="text-white text-4xl opacity-30">✦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#D6CABB] uppercase tracking-widest mb-1">{story.genre}</p>
                    <h2 className="text-base font-semibold text-[#F5F0E8] mb-1 line-clamp-2 group-hover:underline">
                      {story.title}
                    </h2>
                    {story.subtitle && <p className="text-sm text-[#E9E4DA] line-clamp-2 mb-2">{story.subtitle}</p>}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#D6CABB]">{new Date(story.created_at).toLocaleDateString()}</p>
                      {typeof story.views === "number" && (
                        <span className="flex items-center gap-1 text-xs text-[#D6CABB]">
                          <Eye className="w-3 h-3" />
                          {story.views}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(17,12,10,0.58)" }}
        >
          <div className="theme-panel rounded-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D6CABB]/20">
              <h3 className="font-bold text-[#F5F0E8] capitalize">{showModal}</h3>
              <button onClick={() => setShowModal(null)} className="text-[#D6CABB] hover:text-[#F5F0E8] text-xl">✕</button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {modalUsers.length === 0 ? (
                <p className="text-[#D6CABB] text-sm p-5">No {showModal} yet.</p>
              ) : (
                modalUsers.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    onClick={() => setShowModal(null)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E9E4DA] overflow-hidden flex items-center justify-center text-sm font-bold text-[#4B1F24] shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        u.full_name?.charAt(0) || "?"
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F5F0E8]">{u.full_name}</p>
                      <p className="text-xs text-[#D6CABB]">@{u.username}</p>
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
