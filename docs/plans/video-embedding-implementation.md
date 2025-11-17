# Video Embedding Implementation Plan

**Status:** Draft
**Created:** 2025-11-17
**Goal:** Build a video embedding system that allows users to play videos from external platforms (YouTube, Vimeo, etc.) within Magna Galactica without self-hosting

---

## Overview

Magna Galactica will be a **wrapper platform** that embeds videos from external sources and focuses on curation, context, and conversation. This approach:
- Eliminates infrastructure costs for video hosting/streaming
- Leverages existing platform CDNs for optimal performance
- Allows us to focus on our differentiator: context + curation + discussion

---

## Architecture

### High-Level Flow
```
User submits video URL
    ↓
Backend fetches metadata (title, thumbnail, duration) via platform API
    ↓
Store metadata + URL in database
    ↓
Frontend embeds video using platform-specific player (iframe/SDK)
    ↓
User watches + engages with context/discussion layers
```

### Tech Stack Additions
- **Frontend:** `react-player` (universal video player for React)
- **Backend:** Platform API clients (YouTube Data API v3, Vimeo API)
- **Database:** PostgreSQL with video metadata schema
- **Optional:** Redis for caching API responses

---

## Phase 1: Foundation (MVP)

**Goal:** Get basic YouTube video embedding working

### 1.1 Database Schema

```sql
-- Videos table
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,  -- 'youtube', 'vimeo', etc.
    platform_id VARCHAR(255) NOT NULL,  -- Video ID on platform
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration INTEGER,  -- seconds
    channel_name VARCHAR(255),
    channel_url TEXT,
    view_count BIGINT,
    published_at TIMESTAMP,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(platform, platform_id)
);

-- Categories table (already referenced in mock data)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Video tags (for cross-topic linking)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE video_tags (
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, tag_id)
);

-- Indexes
CREATE INDEX idx_videos_platform ON videos(platform);
CREATE INDEX idx_videos_category ON videos(category_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
```

### 1.2 Backend API Endpoints

**File:** `backend/main.py`

```python
# Required packages
# pip install fastapi sqlalchemy psycopg2-binary google-api-python-client python-dotenv

# Endpoints to implement:
POST   /api/videos              # Submit new video
GET    /api/videos              # List videos (with pagination, filters)
GET    /api/videos/{id}         # Get video details
PUT    /api/videos/{id}         # Update video metadata
DELETE /api/videos/{id}         # Delete video
GET    /api/videos/search       # Search videos
GET    /api/categories          # List categories
```

### 1.3 YouTube Metadata Fetcher

**File:** `backend/services/youtube.py`

```python
from googleapiclient.discovery import build
import os

class YouTubeService:
    def __init__(self):
        self.api_key = os.getenv('YOUTUBE_API_KEY')
        self.youtube = build('youtube', 'v3', developerKey=self.api_key)

    def extract_video_id(self, url: str) -> str:
        """Extract video ID from various YouTube URL formats"""
        # Handle youtu.be, youtube.com/watch?v=, youtube.com/embed/, etc.
        pass

    def get_video_metadata(self, video_id: str) -> dict:
        """Fetch video metadata from YouTube API"""
        response = self.youtube.videos().list(
            part='snippet,contentDetails,statistics',
            id=video_id
        ).execute()
        # Parse and return structured metadata
        pass
```

### 1.4 Frontend Components

**File:** `frontend/components/VideoPlayer.tsx`

```typescript
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  platform: string;
}

export function VideoPlayer({ url, platform }: VideoPlayerProps) {
  return (
    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        config={{
          youtube: {
            playerVars: { modestbranding: 1 }
          }
        }}
      />
    </div>
  );
}
```

**File:** `frontend/components/VideoSubmitForm.tsx`

```typescript
'use client';
import { useState } from 'react';

export function VideoSubmitForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const video = await response.json();
        // Redirect to video page or show success
      }
    } catch (error) {
      console.error('Failed to submit video:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form UI */}
    </form>
  );
}
```

### 1.5 Video Detail Page

**File:** `frontend/app/videos/[id]/page.tsx`

```typescript
// Full video detail page with:
// - Embedded player
// - Video metadata (title, channel, description)
// - Context section (to be implemented in Phase 2)
// - Discussion section (to be implemented in Phase 3)
```

---

## Phase 2: Context Layer

**Goal:** Add the "wrapper" that makes MG valuable

### 2.1 Context Features

```sql
-- Video context/commentary
CREATE TABLE video_contexts (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    context_type VARCHAR(50) NOT NULL,  -- 'summary', 'timeline', 'reference', 'quote'
    content TEXT NOT NULL,
    timestamp INTEGER,  -- For timeline entries (seconds)
    author_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cross-references between videos
CREATE TABLE video_references (
    id SERIAL PRIMARY KEY,
    source_video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    target_video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    reference_type VARCHAR(50) NOT NULL,  -- 'related', 'response', 'cited', 'prerequisite'
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(source_video_id, target_video_id, reference_type)
);
```

### 2.2 Context Components

- **Summary section:** AI-generated or user-contributed summaries
- **Timeline:** Key moments with timestamps (clickable to jump in video)
- **References:** Links to related videos, articles, papers
- **Key quotes:** Timestamped important quotes from the video
- **Prerequisites:** Videos to watch first for context

---

## Phase 3: Discussion Layer

**Goal:** Reddit/X-style conversation

### 3.1 Comments Schema

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,  -- For threading
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp INTEGER,  -- Optional: timestamp in video this comment refers to
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP  -- Soft delete
);

CREATE TABLE comment_votes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL,  -- 'upvote' or 'downvote'
    created_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY (user_id, comment_id)
);

CREATE INDEX idx_comments_video ON comments(video_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
```

### 3.2 Discussion Features

- Threaded comments
- Upvote/downvote system
- Sort by: newest, oldest, most upvoted
- Timestamp-linked comments (jump to moment in video)
- Markdown support
- @mentions and notifications

---

## Phase 4: Multi-Platform Support

**Goal:** Support Vimeo, Dailymotion, other platforms

### 4.1 Platform Adapters

Create abstraction layer for different platforms:

```python
# backend/services/platform_factory.py

class PlatformFactory:
    @staticmethod
    def get_service(url: str):
        if 'youtube.com' in url or 'youtu.be' in url:
            return YouTubeService()
        elif 'vimeo.com' in url:
            return VimeoService()
        # ... etc
```

### 4.2 Supported Platforms (Priority Order)

1. **YouTube** (MVP - largest library)
2. **Vimeo** (high-quality educational content)
3. **Dailymotion** (international content)
4. **Twitch** (live streams, VODs)
5. **Custom embeds** (via oembed or direct iframe)

---

## Phase 5: Advanced Features

### 5.1 Search & Discovery
- Full-text search across titles, descriptions, context
- Elasticsearch/Algolia integration
- Filters: platform, category, duration, date
- Personalized recommendations

### 5.2 Collections/Playlists
- User-created collections of videos
- Curated learning paths
- Topic-based playlists

### 5.3 AI Enhancement
- Auto-generate summaries (using transcripts)
- Auto-tag videos
- Auto-suggest related videos
- Extract key quotes

### 5.4 Analytics
- View tracking
- Engagement metrics
- Popular topics/trends
- User activity tracking

---

## Technical Considerations

### Performance Optimizations
- **Caching:** Redis cache for API responses (YouTube API has quotas)
- **Pagination:** Cursor-based for infinite scroll
- **Lazy loading:** Load thumbnails progressively
- **CDN:** Serve thumbnails from CDN
- **Database:** Proper indexing on common query patterns

### Security
- **Rate limiting:** Prevent abuse of submission endpoint
- **URL validation:** Verify URLs before fetching metadata
- **CORS:** Proper CORS configuration
- **Authentication:** JWT-based auth for users
- **Content moderation:** Flag system for inappropriate content

### Error Handling
- **Invalid URLs:** Graceful error messages
- **API failures:** Retry logic with exponential backoff
- **Deleted videos:** Handle videos removed from source platform
- **Quota limits:** Handle YouTube API quota exhaustion

---

## Dependencies to Install

### Backend
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
pip install google-api-python-client  # YouTube API
pip install vimeo  # Vimeo API (if supporting)
pip install alembic  # Database migrations
```

### Frontend
```bash
npm install react-player  # Universal video player
npm install @tanstack/react-query  # Data fetching
npm install zod  # Schema validation
```

---

## Environment Variables

```bash
# .env (backend)
DATABASE_URL=postgresql://user:password@localhost:5432/magna_galactica
YOUTUBE_API_KEY=your_youtube_api_key_here
VIMEO_ACCESS_TOKEN=your_vimeo_token_here
REDIS_URL=redis://localhost:6379
```

---

## Success Metrics (MVP)

- [ ] Users can submit YouTube URLs
- [ ] Video metadata auto-populates from YouTube API
- [ ] Videos play smoothly in embedded player
- [ ] Video detail page shows metadata + player
- [ ] Homepage grid shows real videos from database
- [ ] Basic search works across video titles
- [ ] Database properly stores and retrieves videos

---

## Future Enhancements

- WebSocket support for real-time comments
- Video chapters/timestamps (imported from YouTube)
- Browser extension for one-click submission
- API for third-party integrations
- Mobile apps (React Native)
- Podcast/audio-only support
- Live streaming support

---

## Next Steps

1. Set up PostgreSQL database
2. Implement basic video schema
3. Create YouTube API integration
4. Build video submission endpoint
5. Create video player component
6. Build video detail page
7. Update homepage to fetch real videos
8. Add video submission UI

---

## Notes

- Start with YouTube only for MVP validation
- Focus on core loop: Submit → Curate → Discuss
- Keep infrastructure lean, add features based on user feedback
- Prioritize curation tools over platform features early on
