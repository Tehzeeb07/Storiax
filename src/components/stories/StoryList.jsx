import StoryCard from "./StoryCard";

export default function StoryList({ stories }) {
  if (stories.length === 0) {
    return <p className="text-gray-400">No stories found.</p>;
  }

  return (
    <div>
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}