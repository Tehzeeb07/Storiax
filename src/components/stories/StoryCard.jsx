import { Link } from "react-router-dom";

export default function StoryCard({ story }) {
  return (
    <div className="border-b border-gray-200 py-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link
          to={`/profile/${story.author_id}`}
          className="hover:underline hover:text-black transition"
        >
          {story.profiles?.username || "Unknown"}
        </Link>
        <span>·</span>
        <span>{story.genre}</span>
        <span>·</span>
        <span>{new Date(story.created_at).toLocaleDateString()}</span>
      </div>
      <h2 className="text-xl font-bold mb-1">{story.title}</h2>
      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{story.subtitle}</p>
      <Link
        to={`/story/${story.id}`}
        className="text-sm text-black font-medium hover:underline"
      >
        Read more →
      </Link>
    </div>
  );
}