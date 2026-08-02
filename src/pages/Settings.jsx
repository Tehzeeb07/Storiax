import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) {
        setProfile({
          full_name: data.full_name || "",
          username: data.username || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert(uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (!updateError) {
      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
    }

    setUploadingAvatar(false);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
    } else {
      alert("Profile updated successfully!");
    }
    setSaving(false);
  }

  if (loading) return <p className="p-10 text-[#D6CABB]">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="theme-panel rounded-[2rem] p-6 md:p-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-[#D6CABB] mb-3">Account</p>
          <h1 className="text-3xl font-serif font-bold text-[#F5F0E8] mb-2">Settings</h1>
          <p className="text-[#D6CABB]">Update your profile information.</p>
        </div>

        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#E9E4DA] overflow-hidden flex items-center justify-center text-2xl font-bold text-[#4B1F24] shrink-0 border border-[#D6CABB]/30">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              profile.full_name?.charAt(0) || "?"
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer rounded-full border border-[#D6CABB] px-4 py-2 text-sm text-[#F5F0E8] hover:bg-white/10 transition">
              {uploadingAvatar ? "Uploading..." : "Upload Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-[#F5F0E8] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full border border-[#D6CABB]/30 rounded-xl px-4 py-3 text-sm bg-[#F5F0E8]/10 text-[#F5F0E8] placeholder:text-[#D6CABB] focus:outline-none focus:ring-2 focus:ring-[#6A4A50]/25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F5F0E8] mb-1">
              Username
            </label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full border border-[#D6CABB]/30 rounded-xl px-4 py-3 text-sm bg-[#F5F0E8]/10 text-[#F5F0E8] placeholder:text-[#D6CABB] focus:outline-none focus:ring-2 focus:ring-[#6A4A50]/25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F5F0E8] mb-1">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full border border-[#D6CABB]/30 rounded-xl px-4 py-3 text-sm bg-[#F5F0E8]/10 text-[#F5F0E8] placeholder:text-[#D6CABB] focus:outline-none focus:ring-2 focus:ring-[#6A4A50]/25 resize-none"
              placeholder="Tell readers a little about yourself..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#4B1F24] text-white px-6 py-3 rounded-full text-sm hover:bg-[#381015] transition disabled:opacity-50 shadow-sm self-start"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
