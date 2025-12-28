// backend/seed.js
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Channel from "./models/Channel.js";
import Video from "./models/Video.js";
import Comment from "./models/Comment.js";
import bcrypt from "bcryptjs";

/*
  This seed script will:
  - connect to the DB using MONGO_URI from .env
  - wipe Users, Channels, Videos, Comments
  - create several users and channels
  - insert 20 videos across many categories (videoId: video01..video20)
  - add a few comments
  - link videos -> channels and comments -> videos
*/

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not set in environment");
      process.exit(1);
    }

    await connectDB(process.env.MONGO_URI);
    console.log("Connected to DB");

    // clear collections
    await Promise.all([
      User.deleteMany({}),
      Channel.deleteMany({}),
      Video.deleteMany({}),
      Comment.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // create users
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("password123", salt);

    const usersData = [
      { username: "JohnDoe", email: "john@example.com", avatar: "https://i.pravatar.cc/150?u=john" },
      { username: "ChaiAurCode", email: "chai@example.com", avatar: "https://i.pravatar.cc/150?u=chai" },
      { username: "JSMastery", email: "js@example.com", avatar: "https://i.pravatar.cc/150?u=js" },
      { username: "AlgoDaily", email: "algo@example.com", avatar: "https://i.pravatar.cc/150?u=algo" },
      { username: "MusicBox", email: "music@example.com", avatar: "https://i.pravatar.cc/150?u=music" },
      { username: "LiveDev", email: "live@example.com", avatar: "https://i.pravatar.cc/150?u=live" }
    ];

    const users = [];
    for (const u of usersData) {
      const user = await User.create({ username: u.username, email: u.email, password: hashed, avatar: u.avatar, channels: [] });
      users.push(user);
    }
    console.log("Created users:", users.map(u => u.username).join(", "));

    // create channels (one for each of first 6 users)
    const channelsData = [
      { channelName: "Code with John", owner: users[0]._id, description: "Coding tutorials and tech reviews by John", channelBanner: "https://picsum.photos/seed/banner1/1200/300", subscribers: 5200 },
      { channelName: "Chai aur Code", owner: users[1]._id, description: "Small, practical coding lessons", channelBanner: "https://picsum.photos/seed/banner2/1200/300", subscribers: 8400 },
      { channelName: "JS Mastery", owner: users[2]._id, description: "JavaScript tips & deep dives", channelBanner: "https://picsum.photos/seed/banner3/1200/300", subscribers: 10200 },
      { channelName: "AlgoDaily", owner: users[3]._id, description: "Data Structures & Algorithms", channelBanner: "https://picsum.photos/seed/banner4/1200/300", subscribers: 7600 },
      { channelName: "MusicBox", owner: users[4]._id, description: "Playlists & mixes", channelBanner: "https://picsum.photos/seed/banner5/1200/300", subscribers: 54000 },
      { channelName: "Live Dev", owner: users[5]._id, description: "Live coding sessions & projects", channelBanner: "https://picsum.photos/seed/banner6/1200/300", subscribers: 12000 }
    ];

    const channels = [];
    for (const c of channelsData) {
      const channel = await Channel.create({
        channelName: c.channelName,
        owner: c.owner,
        description: c.description,
        channelBanner: c.channelBanner,
        subscribers: c.subscribers,
        videos: []
      });
      channels.push(channel);
      // add channel reference to owner's channels array
      await User.findByIdAndUpdate(c.owner, { $push: { channels: channel._id } });
    }
    console.log("Created channels:", channels.map(c => c.channelName).join(", "));

    // 20 videos dataset (as provided)
    const videosData = [
      {
        videoId: "video01",
        title: "React JS Roadmap 2025 | Beginner to Advanced",
        category: "Web Development",
        thumbnailUrl: "https://picsum.photos/seed/react1/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        description: "Complete roadmap to learn React in 2025.",
        channelIndex: 0,
        uploaderIndex: 0,
        views: 125000,
        likes: 4500,
        dislikes: 120,
        uploadDate: new Date("2024-12-01")
      },
      {
        videoId: "video02",
        title: "Full MERN Stack Course | MongoDB, Express, React, Node",
        category: "Web Development",
        thumbnailUrl: "https://picsum.photos/seed/mern/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        description: "Free full MERN stack course for beginners.",
        channelIndex: 0,
        uploaderIndex: 0,
        views: 240000,
        likes: 12000,
        dislikes: 200,
        uploadDate: new Date("2024-08-21")
      },
      {
        videoId: "video03",
        title: "JavaScript Crash Course for Beginners",
        category: "JavaScript",
        thumbnailUrl: "https://picsum.photos/seed/js1/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        description: "Learn the basics of JavaScript in 1 hour!",
        channelIndex: 2,
        uploaderIndex: 2,
        views: 900000,
        likes: 30000,
        dislikes: 900,
        uploadDate: new Date("2024-01-10")
      },
      {
        videoId: "video04",
        title: "Async JS Explained | Callbacks, Promises, Async Await",
        category: "JavaScript",
        thumbnailUrl: "https://picsum.photos/seed/async/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        description: "Master async JavaScript concepts in depth.",
        channelIndex: 2,
        uploaderIndex: 2,
        views: 540000,
        likes: 15000,
        dislikes: 300,
        uploadDate: new Date("2024-03-14")
      },
      {
        videoId: "video05",
        title: "Data Structures Full Course in 3 Hours",
        category: "Data Structures",
        thumbnailUrl: "https://picsum.photos/seed/dsa1/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        description: "Complete DSA for beginners using JavaScript.",
        channelIndex: 3,
        uploaderIndex: 3,
        views: 780000,
        likes: 25000,
        dislikes: 600,
        uploadDate: new Date("2024-05-19")
      },
      {
        videoId: "video06",
        title: "Binary Search Explained with Examples",
        category: "Data Structures",
        thumbnailUrl: "https://picsum.photos/seed/bsearch/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        description: "Understand binary search step by step.",
        channelIndex: 3,
        uploaderIndex: 3,
        views: 230000,
        likes: 6800,
        dislikes: 140,
        uploadDate: new Date("2024-04-10")
      },
      {
        videoId: "video07",
        title: "Node.js Server Crash Course",
        category: "Server",
        thumbnailUrl: "https://picsum.photos/seed/node/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        description: "Learn backend development with Node.js.",
        channelIndex: 1,
        uploaderIndex: 1,
        views: 390000,
        likes: 11000,
        dislikes: 250,
        uploadDate: new Date("2024-02-02")
      },
      {
        videoId: "video08",
        title: "Express.js Full Course for Beginners",
        category: "Server",
        thumbnailUrl: "https://picsum.photos/seed/express/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
        description: "Learn Express from scratch with real APIs.",
        channelIndex: 1,
        uploaderIndex: 1,
        views: 410000,
        likes: 17000,
        dislikes: 90,
        uploadDate: new Date("2024-07-05")
      },
      {
        videoId: "video09",
        title: "Top Lofi Beats to Code/Study",
        category: "Music",
        thumbnailUrl: "https://picsum.photos/seed/lofi/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        description: "Relaxing lofi beats for productivity.",
        channelIndex: 4,
        uploaderIndex: 4,
        views: 12000000,
        likes: 450000,
        dislikes: 3000,
        uploadDate: new Date("2023-11-05")
      },
      {
        videoId: "video10",
        title: "Best Chill Vibes Playlist 2025",
        category: "Music",
        thumbnailUrl: "https://picsum.photos/seed/chill/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        description: "Perfect chill music mix for relaxation.",
        channelIndex: 4,
        uploaderIndex: 4,
        views: 8000000,
        likes: 230000,
        dislikes: 1500,
        uploadDate: new Date("2024-06-22")
      },
      {
        videoId: "video11",
        title: "IT Career Roadmap for Freshers",
        category: "Information Technology",
        thumbnailUrl: "https://picsum.photos/seed/it1/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        description: "Full guide for starting a career in IT.",
        channelIndex: 0,
        uploaderIndex: 0,
        views: 140000,
        likes: 5800,
        dislikes: 100,
        uploadDate: new Date("2024-05-30")
      },
      {
        videoId: "video12",
        title: "How the Internet Works | Explained",
        category: "Information Technology",
        thumbnailUrl: "https://picsum.photos/seed/internet/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        description: "A clear explanation of how the internet works.",
        channelIndex: 0,
        uploaderIndex: 0,
        views: 500000,
        likes: 20000,
        dislikes: 400,
        uploadDate: new Date("2024-03-03")
      },
      {
        videoId: "video13",
        title: "GTA 6 Trailer Breakdown",
        category: "Gaming",
        thumbnailUrl: "https://picsum.photos/seed/gta/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        description: "Detailed breakdown of the official GTA 6 trailer.",
        channelIndex: 5,
        uploaderIndex: 5,
        views: 9100000,
        likes: 350000,
        dislikes: 6000,
        uploadDate: new Date("2024-02-28")
      },
      {
        videoId: "video14",
        title: "Minecraft Mega Build Timelapse",
        category: "Gaming",
        thumbnailUrl: "https://picsum.photos/seed/mc/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        description: "Watch an epic Minecraft build come to life.",
        channelIndex: 5,
        uploaderIndex: 5,
        views: 3000000,
        likes: 90000,
        dislikes: 800,
        uploadDate: new Date("2024-01-15")
      },
      {
        videoId: "video15",
        title: "Live Coding: Build a YouTube Clone in React",
        category: "Live",
        thumbnailUrl: "https://picsum.photos/seed/live1/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        description: "Watch live coding of a YouTube clone.",
        channelIndex: 5,
        uploaderIndex: 5,
        views: 88000,
        likes: 3500,
        dislikes: 40,
        uploadDate: new Date("2024-06-20")
      },
      {
        videoId: "video16",
        title: "Resume Tips for Software Engineers",
        category: "Resume",
        thumbnailUrl: "https://picsum.photos/seed/resume1/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
        description: "How to create a strong resume for tech roles.",
        channelIndex: 0,
        uploaderIndex: 0,
        views: 140000,
        likes: 6200,
        dislikes: 90,
        uploadDate: new Date("2024-04-20")
      },
      {
        videoId: "video17",
        title: "Interview Questions: Full Stack Developer",
        category: "Web Development",
        thumbnailUrl: "https://picsum.photos/seed/interview/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        description: "Common interview Q&A for full stack roles.",
        channelIndex: 0,
        uploaderIndex: 0,
        views: 99000,
        likes: 6100,
        dislikes: 35,
        uploadDate: new Date("2024-04-25")
      },
      {
        videoId: "video18",
        title: "System Design: Scalable Video Streaming",
        category: "Web Development",
        thumbnailUrl: "https://picsum.photos/seed/sys/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        description: "Design a streaming platform like YouTube.",
        channelIndex: 0,
        uploaderIndex: 0,
        views: 98000,
        likes: 4200,
        dislikes: 28,
        uploadDate: new Date("2024-03-10")
      },
      {
        videoId: "video19",
        title: "Top EDM Mix 2024",
        category: "Music",
        thumbnailUrl: "https://picsum.photos/seed/edm/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        description: "EDM mix for parties and workouts.",
        channelIndex: 4,
        uploaderIndex: 4,
        views: 560000,
        likes: 37000,
        dislikes: 210,
        uploadDate: new Date("2024-06-10")
      },
      {
        videoId: "video20",
        title: "Information Technology Trends 2024",
        category: "Information Technology",
        thumbnailUrl: "https://picsum.photos/seed/it2/400/225",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        description: "Top IT trends and skills to learn.",
        channelIndex: 0,
        uploaderIndex: 0,
        views: 65000,
        likes: 3100,
        dislikes: 20,
        uploadDate: new Date("2024-05-30")
      }
    ];

    // create videos, link to channels and uploader
    const createdVideos = [];
    for (const vdata of videosData) {
      const channel = channels[vdata.channelIndex];
      const uploader = users[vdata.uploaderIndex];

      const video = await Video.create({
        videoId: vdata.videoId,
        title: vdata.title,
        thumbnailUrl: vdata.thumbnailUrl,
        videoUrl: vdata.videoUrl,
        description: vdata.description,
        category: vdata.category,
        channel: channel._id,
        uploader: uploader._id,
        views: vdata.views,
        likes: vdata.likes,
        dislikes: vdata.dislikes,
        uploadDate: vdata.uploadDate,
        comments: []
      });

      // push video id into channel.videos
      channel.videos.push(video._id);
      await channel.save();

      createdVideos.push(video);
    }
    console.log("Inserted videos:", createdVideos.length);

    // create some comments (attach to a few videos)
    const commentsToCreate = [
      { text: "Amazing tutorial — helped me a lot!", user: users[1]._id, video: createdVideos[0]._id, timestamp: new Date() },
      { text: "Great explanation, thanks!", user: users[2]._id, video: createdVideos[2]._id, timestamp: new Date() },
      { text: "Can you provide code examples?", user: users[3]._id, video: createdVideos[4]._id, timestamp: new Date() },
      { text: "This mix is fire 🔥", user: users[4]._id, video: createdVideos[8]._id, timestamp: new Date() },
      { text: "Very useful interview tips.", user: users[0]._id, video: createdVideos[16]._id, timestamp: new Date() }
    ];

    for (const c of commentsToCreate) {
      const comm = await Comment.create({
        text: c.text,
        userId: c.user,
        videoId: c.video,
        timestamp: c.timestamp
      });
      // push into video's comments array
      await Video.findByIdAndUpdate(c.video, { $push: { comments: comm._id } });
    }
    console.log("Inserted comments");

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

run();
