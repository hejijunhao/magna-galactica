"use client";

import { useState } from "react";
import { Sparkles, Compass, TrendingUp, User, LogIn } from "lucide-react";

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
      <div className="relative aspect-video bg-white/5 mb-2 rounded-md overflow-hidden border border-white/10 group-hover:border-blue-400/40 transition-all duration-300">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Duration badge */}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/90 text-white text-[10px] font-mono rounded backdrop-blur-sm">
          {video.duration}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Video Info */}
      <div>
        <h3 className="font-semibold text-xs text-white mb-1 leading-tight group-hover:text-blue-300 transition-colors line-clamp-2">
          {video.title}
        </h3>
        <p className="text-[10px] text-blue-200/50 mb-0.5 font-mono">
          {video.channel}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-blue-300/40 font-mono">
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
  const [activeNav, setActiveNav] = useState("For You");

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
        <div className="flex items-center py-6">
          {/* Logo - Aligned with Sidebar */}
          <div className="w-64 shrink-0 px-6 leading-none">
            <div className="text-2xl font-normal text-white tracking-[0.15em] [font-family:var(--font-michroma)]">
              MAGNA GALACTICA
            </div>
            <div className="text-[10px] text-blue-300/50 font-mono tracking-[0.3em] uppercase mt-1">
              Knowledge Protocol
            </div>
          </div>

          {/* Search Bar - Centered and Wide */}
          <div className="flex-1 px-6">
            <div className="max-w-3xl mx-auto">
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

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 sticky top-[73px] h-[calc(100vh-73px)] border-r border-white/10 bg-[#020307]/50 backdrop-blur-sm">
          <nav className="p-4 space-y-1">
            {[
              { name: "For You", icon: Sparkles },
              { name: "Explore", icon: Compass },
              { name: "Trending", icon: TrendingUp },
              { name: "Profile", icon: User },
              { name: "Login", icon: LogIn },
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm transition-all duration-200 ${
                    activeNav === item.name
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-400/30 shadow-lg shadow-blue-500/10"
                      : "text-blue-200/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComponent className="w-4 h-4 text-blue-400" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1">
          {/* Category Pills */}
          <div className="border-b border-white/10 bg-[#020307]/80 backdrop-blur-md sticky top-[73px] z-40">
            <div className="px-6 py-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
          <main className="px-4 py-6">
        {/* Trending Section */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full shadow-lg shadow-blue-400/50" />
            <h2 className="text-lg font-bold text-white font-mono">
              Trending Now
            </h2>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
            {mockVideos.slice(0, 4).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>

        {/* Featured Content */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full shadow-lg shadow-purple-400/50" />
            <h2 className="text-lg font-bold text-white font-mono">
              Featured
            </h2>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
            {mockVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>

        {/* Technology Category */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/50" />
              <h2 className="text-lg font-bold text-white font-mono">
                Technology
              </h2>
            </div>
            <button className="text-xs text-blue-300 hover:text-white font-mono font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
            {mockVideos
              .filter((v) => v.category === "Technology")
              .map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
          </div>
        </section>

        {/* Science Category */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-400/50" />
              <h2 className="text-lg font-bold text-white font-mono">
                Science
              </h2>
            </div>
            <button className="text-xs text-blue-300 hover:text-white font-mono font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
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
      </div>
    </div>
  );
}
