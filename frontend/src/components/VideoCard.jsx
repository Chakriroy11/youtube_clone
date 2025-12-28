import React from "react";
import { Link } from "react-router-dom"; // Used for internal routing

export default function VideoCard({ video }) {
  return (
    <div className="overflow-hidden bg-white shadow-sm rounded-xl">
      {/* Link to the specific video page */}
      <Link to={`/video/${video._id}`}>
        <img
          src={video.thumbnailUrl || "https://picsum.photos/400/225"}
          alt={video.title}
          className="object-cover w-full aspect-video"
        />
      </Link>
      <div className="p-3">
        {/* Video Title */}
        <p className="text-sm font-semibold line-clamp-2">{video.title}</p>
        {/* Uploader/Channel and Views */}
        <p className="mt-1 text-xs text-gray-600">
          {video.uploader?.username || video.channel?.channelName} •{" "}
          {video.views} views
        </p>
      </div>
    </div>
  );
}