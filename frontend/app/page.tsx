"use client";

import { useState } from "react";

// Mock video data
const mockVideos = [
  {
    id: 1,
    title: "The Complete History of Computing: From Babbage to Modern AI",
    channel: "Tech Chronicles",
    views: "2.3M",
    timestamp: "2 weeks ago",
    duration: "2:34:15",
    thumbnail: "https://picsum.photos/seed/tech1/400/225",
    category: "Technology",
  },
  {
    id: 2,
    title: "Quantum Mechanics Explained: A Deep Dive into the Fundamentals",
    channel: "Physics Explained",
    views: "1.8M",
    timestamp: "1 month ago",
    duration: "1:45:30",
    thumbnail: "https://picsum.photos/seed/quantum/400/225",
    category: "Science",
  },
  {
    id: 3,
    title: "Renaissance Art & Philosophy: The Birth of Modern Thought",
    channel: "Art History",
    views: "890K",
    timestamp: "3 days ago",
    duration: "3:12:45",
    thumbnail: "https://picsum.photos/seed/renaissance/400/225",
    category: "Arts & Humanities",
  },
  {
    id: 4,
    title: "Blockchain Technology: Beyond Cryptocurrency",
    channel: "Future Tech",
    views: "1.2M",
    timestamp: "1 week ago",
    duration: "1:28:20",
    thumbnail: "https://picsum.photos/seed/blockchain/400/225",
    category: "Technology",
  },
  {
    id: 5,
    title: "The Philosophy of Consciousness and Free Will",
    channel: "Philosophy Matters",
    views: "560K",
    timestamp: "5 days ago",
    duration: "2:05:15",
    thumbnail: "https://picsum.photos/seed/philosophy/400/225",
    category: "Philosophy",
  },
  {
    id: 6,
    title: "Climate Science: Understanding Our Changing Planet",
    channel: "Earth Sciences",
    views: "3.1M",
    timestamp: "2 weeks ago",
    duration: "2:15:40",
    thumbnail: "https://picsum.photos/seed/climate/400/225",
    category: "Science",
  },
];

const categories = [
  "All",
  "Technology",
  "Science",
  "Philosophy",
  "Arts & Humanities",
  "History",
  "Mathematics",
  "Economics",
];

function VideoCard({ video }: { video: typeof mockVideos[0] }) {
  return (
    <div className="group cursor-pointer">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-white/5 mb-3 rounded-lg overflow-hidden border border-white/10 group-hover:border-blue-400/40 transition-all duration-300">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/90 text-white text-xs font-mono rounded backdrop-blur-sm">
          {video.duration}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Video Info */}
      <div>
        <h3 className="font-bold text-sm text-white mb-1.5 leading-tight group-hover:text-blue-300 transition-colors line-clamp-2">
          {video.title}
        </h3>
        <p className="text-xs text-blue-200/50 mb-1 font-mono">
          {video.channel}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-blue-300/40 font-mono">
          <span>{video.views} views</span>
          <span>·</span>
          <span>{video.timestamp}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all duration-200 rounded-md border font-mono ${
        active
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400/50 shadow-lg shadow-blue-500/30"
          : "bg-white/5 text-blue-200/70 border-white/20 hover:border-blue-400/40 hover:text-white hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020307] via-[#050810] to-[#0a0f1a] relative overflow-hidden">
      {/* Starfield Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#020307]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center gap-6">
            {/* Logo - Text Only */}
            <div className="text-center leading-none">
              <div className="text-5xl font-normal text-white tracking-[0.25em] mb-2 [font-family:var(--font-michroma)]">
                MAGNA GALACTICA
              </div>
              <div className="text-xs text-blue-300/50 font-mono tracking-[0.4em] uppercase">
                Knowledge Protocol
              </div>
            </div>

            {/* Search Bar - Centered and Simplified */}
            <div className="w-full max-w-2xl">
              <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm focus-within:border-blue-400/50 focus-within:ring-1 focus-within:ring-blue-400/30 focus-within:bg-white/10 transition-all">
                <span className="pl-4 pr-2 text-blue-300/50 font-mono text-sm">
                  &gt;
                </span>
                <input
                  type="text"
                  placeholder="Search videos, topics, ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-3 bg-transparent text-white placeholder-blue-200/40 focus:outline-none font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Pills */}
      <div className="border-b border-white/10 bg-[#020307]/80 backdrop-blur-md">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
            {categories.map((category) => (
              <CategoryPill
                key={category}
                label={category}
                active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Trending Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full shadow-lg shadow-blue-400/50" />
            <h2 className="text-xl font-bold text-white font-mono">
              Trending Now
            </h2>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockVideos.slice(0, 4).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>

        {/* Featured Content */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full shadow-lg shadow-purple-400/50" />
            <h2 className="text-xl font-bold text-white font-mono">
              Featured
            </h2>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>

        {/* Technology Category */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/50" />
              <h2 className="text-xl font-bold text-white font-mono">
                Technology
              </h2>
            </div>
            <button className="text-sm text-blue-300 hover:text-white font-mono font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockVideos
              .filter((v) => v.category === "Technology")
              .map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
          </div>
        </section>

        {/* Science Category */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-400/50" />
              <h2 className="text-xl font-bold text-white font-mono">
                Science
              </h2>
            </div>
            <button className="text-sm text-blue-300 hover:text-white font-mono font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockVideos
              .filter((v) => v.category === "Science")
              .map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-mono">
            <div>
              <div className="text-white font-bold mb-3">System Status</div>
              <div className="text-blue-200/40 space-y-1.5">
                <div>Network: Online</div>
                <div>Latency: 12ms</div>
                <div>Nodes: 9,847</div>
              </div>
            </div>
            <div>
              <div className="text-white font-bold mb-3">Protocol</div>
              <div className="text-blue-200/40 space-y-1.5">
                <div>Version: v1.0.0</div>
                <div>Build: Stable</div>
                <div>License: Open</div>
              </div>
            </div>
            <div>
              <div className="text-white font-bold mb-3">Links</div>
              <div className="text-blue-200/40 space-y-1.5">
                <div>
                  <a href="#" className="hover:text-blue-300 transition-colors">
                    Documentation
                  </a>
                </div>
                <div>
                  <a href="#" className="hover:text-blue-300 transition-colors">
                    API Access
                  </a>
                </div>
                <div>
                  <a href="#" className="hover:text-blue-300 transition-colors">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10 text-center text-blue-200/40 text-xs font-mono">
            © 2025 Magna Galactica · Knowledge Without Limits
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
}
