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
      <div className="relative aspect-video bg-[var(--surface)] mb-3 rounded-lg overflow-hidden border border-[var(--border)]">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/90 text-white text-xs font-mono rounded">
          {video.duration}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Video Info */}
      <div>
        <h3 className="font-bold text-sm text-[var(--foreground)] mb-1.5 leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-2">
          {video.title}
        </h3>
        <p className="text-xs text-[var(--foreground-muted)] mb-1 font-mono">
          {video.channel}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-dim)] font-mono">
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
          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
          : "bg-white text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
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
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl font-mono">M</span>
              </div>
              <div className="leading-none">
                <div className="text-lg font-bold text-[var(--foreground)] font-mono tracking-tight">
                  MAGNA GALACTICA
                </div>
                <div className="text-[10px] text-[var(--foreground-dim)] font-mono tracking-wide">
                  Knowledge Protocol
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden bg-white focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all">
                  <span className="pl-4 pr-2 text-[var(--foreground-dim)] font-mono text-sm">
                    &gt;
                  </span>
                  <input
                    type="text"
                    placeholder="Search videos, topics, ideas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 py-2.5 bg-transparent text-[var(--foreground)] placeholder-[var(--foreground-dim)] focus:outline-none font-mono text-sm"
                  />
                  <button className="px-6 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm font-mono hover:bg-[var(--primary-hover)] transition-colors">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-md border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)] transition-all">
                <svg
                  className="w-5 h-5 text-[var(--foreground-muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <button className="px-4 py-2 bg-[var(--primary)] text-white font-semibold text-sm font-mono rounded-md hover:bg-[var(--primary-hover)] transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Pills */}
      <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
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
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Trending Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[var(--primary)] rounded-full" />
            <h2 className="text-xl font-bold text-[var(--foreground)] font-mono">
              Trending Now
            </h2>
            <div className="flex-1 h-px bg-[var(--border)]" />
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
            <div className="w-1 h-6 bg-[var(--secondary)] rounded-full" />
            <h2 className="text-xl font-bold text-[var(--foreground)] font-mono">
              Featured
            </h2>
            <div className="flex-1 h-px bg-[var(--border)]" />
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
              <div className="w-1 h-6 bg-[var(--accent)] rounded-full" />
              <h2 className="text-xl font-bold text-[var(--foreground)] font-mono">
                Technology
              </h2>
            </div>
            <button className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono font-medium transition-colors">
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
              <div className="w-1 h-6 bg-[var(--primary)] rounded-full" />
              <h2 className="text-xl font-bold text-[var(--foreground)] font-mono">
                Science
              </h2>
            </div>
            <button className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono font-medium transition-colors">
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
        <footer className="mt-16 pt-8 border-t border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-mono">
            <div>
              <div className="text-[var(--foreground)] font-bold mb-3">System Status</div>
              <div className="text-[var(--foreground-dim)] space-y-1.5">
                <div>Network: Online</div>
                <div>Latency: 12ms</div>
                <div>Nodes: 9,847</div>
              </div>
            </div>
            <div>
              <div className="text-[var(--foreground)] font-bold mb-3">Protocol</div>
              <div className="text-[var(--foreground-dim)] space-y-1.5">
                <div>Version: v1.0.0</div>
                <div>Build: Stable</div>
                <div>License: Open</div>
              </div>
            </div>
            <div>
              <div className="text-[var(--foreground)] font-bold mb-3">Links</div>
              <div className="text-[var(--foreground-dim)] space-y-1.5">
                <div>
                  <a href="#" className="hover:text-[var(--primary)] transition-colors">
                    Documentation
                  </a>
                </div>
                <div>
                  <a href="#" className="hover:text-[var(--primary)] transition-colors">
                    API Access
                  </a>
                </div>
                <div>
                  <a href="#" className="hover:text-[var(--primary)] transition-colors">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-[var(--border)] text-center text-[var(--foreground-dim)] text-xs font-mono">
            © 2025 Magna Galactica · Knowledge Without Limits
          </div>
        </footer>
      </main>
    </div>
  );
}
