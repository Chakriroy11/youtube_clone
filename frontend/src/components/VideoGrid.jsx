import React from "react";
import VideoCard from "./VideoCard"; // Imports the card component

export default function VideoGrid({ videos }) {
  // If no videos are passed, render nothing
  if (!videos) return null;

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:pl-20"
    >
      {/* Map over the videos array and render a VideoCard for each item */}
      {videos.map((v) => (
        <VideoCard key={v._id} video={v} />
      ))}
    </div>
  );
}