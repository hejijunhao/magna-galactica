# Database Setup Plan

**Status:** Draft
**Created:** 2025-11-17
**Database:** PostgreSQL 15+ with pgvector extension
**Hosting:** Supabase (recommended) or self-hosted PostgreSQL

---

## Overview

Magna Galactica will use **PostgreSQL with pgvector** as the primary database. This provides:
- Robust relational data model for structured content
- Semantic search via vector embeddings (pgvector)
- Good-enough graph relationship handling
- Single database for all data (videos, users, comments, context)
- Native Supabase integration

### Why PostgreSQL + pgvector?

✅ All-in-one solution (relational + vector search)
✅ Supabase native support (zero additional infrastructure)
✅ Mature ecosystem and tooling
✅ Can handle moderate relationship complexity
✅ Migration path to Neo4j if needed later

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                   │
├─────────────────────────────────────────────────────────┤
│  Core Tables                                             │
│  ├── videos (metadata from YouTube/Vimeo)               │
│  ├── categories (Science, Tech, Philosophy, etc.)       │
│  ├── tags (cross-topic indexing)                        │
│  └── users (authentication, profiles)                   │
│                                                          │
│  Context Layer                                           │
│  ├── video_contexts (summaries, timelines, quotes)      │
│  ├── video_references (cross-video relationships)       │
│  └── video_collections (user-curated playlists)         │
│                                                          │
│  Discussion Layer                                        │
│  ├── comments (threaded discussions)                    │
│  ├── comment_votes (upvote/downvote)                    │
│  └── user_activity (view history, bookmarks)            │
│                                                          │
│  Vector Search (pgvector)                                │
│  └── video embeddings (semantic similarity search)      │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Phase 1: Core Tables (MVP)

#### 1. Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,

    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

#### 2. Categories Table

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,  -- Icon name or emoji
    color TEXT,  -- Hex color for UI theming
    parent_id INTEGER REFERENCES categories(id),  -- For subcategories
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Seed categories from your mock data
INSERT INTO categories (name, slug, description, display_order) VALUES
    ('All', 'all', 'All videos across categories', 0),
    ('Technology', 'technology', 'Computing, AI, engineering', 1),
    ('Science', 'science', 'Physics, biology, chemistry, astronomy', 2),
    ('Philosophy', 'philosophy', 'Ethics, logic, metaphysics', 3),
    ('Arts & Humanities', 'arts-humanities', 'Art, literature, culture', 4),
    ('History', 'history', 'Historical events and analysis', 5),
    ('Mathematics', 'mathematics', 'Pure and applied mathematics', 6),
    ('Economics', 'economics', 'Economics, finance, markets', 7);
```

#### 3. Videos Table (Core)

```sql
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- External platform info
    platform TEXT NOT NULL,  -- 'youtube', 'vimeo', 'dailymotion'
    platform_id TEXT NOT NULL,  -- Video ID on external platform
    url TEXT NOT NULL UNIQUE,

    -- Metadata (fetched from platform API)
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,  -- Duration in seconds
    published_at TIMESTAMPTZ,

    -- Channel/creator info
    channel_name TEXT,
    channel_id TEXT,
    channel_url TEXT,

    -- Statistics (can be updated periodically)
    view_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,

    -- Our categorization
    category_id INTEGER REFERENCES categories(id),

    -- Moderation
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    moderation_status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
    moderation_notes TEXT,

    -- Metadata
    submitted_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata_refreshed_at TIMESTAMPTZ,  -- Last time we fetched fresh data from platform

    -- Constraints
    CONSTRAINT platform_check CHECK (platform IN ('youtube', 'vimeo', 'dailymotion', 'other')),
    CONSTRAINT unique_platform_video UNIQUE(platform, platform_id),
    CONSTRAINT moderation_status_check CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged'))
);

-- Indexes for common queries
CREATE INDEX idx_videos_platform ON videos(platform);
CREATE INDEX idx_videos_category ON videos(category_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX idx_videos_moderation ON videos(moderation_status) WHERE moderation_status = 'approved';
CREATE INDEX idx_videos_featured ON videos(is_featured) WHERE is_featured = true;
CREATE INDEX idx_videos_submitted_by ON videos(submitted_by);

-- Full-text search index
CREATE INDEX idx_videos_search ON videos USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

#### 4. Tags Table

```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);
```

#### 5. Video Tags Junction Table

```sql
CREATE TABLE video_tags (
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (video_id, tag_id)
);

CREATE INDEX idx_video_tags_video ON video_tags(video_id);
CREATE INDEX idx_video_tags_tag ON video_tags(tag_id);
```

### Phase 2: Context Layer

#### 6. Video Contexts (Summaries, Timelines, Quotes)

```sql
CREATE TABLE video_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

    -- Context type
    context_type TEXT NOT NULL,  -- 'summary', 'timeline', 'quote', 'reference', 'note'

    -- Content
    title TEXT,
    content TEXT NOT NULL,

    -- For timeline entries and quotes
    timestamp_seconds INTEGER,  -- Position in video (null for general content)
    end_timestamp_seconds INTEGER,  -- For time ranges

    -- Metadata
    author_id UUID REFERENCES users(id),
    source_url TEXT,  -- External reference if applicable
    is_ai_generated BOOLEAN DEFAULT FALSE,

    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT context_type_check CHECK (context_type IN ('summary', 'timeline', 'quote', 'reference', 'note', 'keypoint'))
);

CREATE INDEX idx_video_contexts_video ON video_contexts(video_id);
CREATE INDEX idx_video_contexts_type ON video_contexts(context_type);
CREATE INDEX idx_video_contexts_timestamp ON video_contexts(timestamp_seconds) WHERE timestamp_seconds IS NOT NULL;
CREATE INDEX idx_video_contexts_author ON video_contexts(author_id);
```

#### 7. Video References (Cross-Video Relationships)

```sql
CREATE TABLE video_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    target_video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

    -- Relationship type
    reference_type TEXT NOT NULL,  -- 'related', 'prerequisite', 'sequel', 'response', 'cited'

    -- Context
    note TEXT,  -- Why these videos are related
    timestamp_seconds INTEGER,  -- Specific moment in source video

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent self-references and duplicates
    CONSTRAINT no_self_reference CHECK (source_video_id != target_video_id),
    CONSTRAINT unique_reference UNIQUE(source_video_id, target_video_id, reference_type),
    CONSTRAINT reference_type_check CHECK (reference_type IN ('related', 'prerequisite', 'sequel', 'response', 'cited', 'contradicts'))
);

CREATE INDEX idx_video_references_source ON video_references(source_video_id);
CREATE INDEX idx_video_references_target ON video_references(target_video_id);
CREATE INDEX idx_video_references_type ON video_references(reference_type);

-- Bidirectional index for "find all connected videos"
CREATE INDEX idx_video_references_both ON video_references(source_video_id, target_video_id);
```

#### 8. Video Collections (Playlists/Learning Paths)

```sql
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,

    -- Ownership
    created_by UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Metadata
    thumbnail_url TEXT,  -- Custom thumbnail or auto-generated
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_creator ON collections(created_by);
CREATE INDEX idx_collections_public ON collections(is_public) WHERE is_public = true;
CREATE INDEX idx_collections_slug ON collections(slug);

CREATE TABLE collection_videos (
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,  -- Order in collection
    note TEXT,  -- Why this video is in the collection
    added_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (collection_id, video_id),
    UNIQUE (collection_id, position)
);

CREATE INDEX idx_collection_videos_collection ON collection_videos(collection_id, position);
```

### Phase 3: Discussion Layer

#### 9. Comments Table (Threaded Discussions)

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,  -- For threading

    -- Comment content
    content TEXT NOT NULL,

    -- Optional timestamp link
    timestamp_seconds INTEGER,  -- Link comment to moment in video

    -- Author
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Voting
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,

    -- Moderation
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT content_not_empty CHECK (char_length(content) > 0)
);

CREATE INDEX idx_comments_video ON comments(video_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_timestamp ON comments(video_id, timestamp_seconds) WHERE timestamp_seconds IS NOT NULL;

-- For finding top-level comments
CREATE INDEX idx_comments_top_level ON comments(video_id, created_at DESC) WHERE parent_id IS NULL AND is_deleted = false;
```

#### 10. Comment Votes

```sql
CREATE TABLE comment_votes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL,  -- 'upvote' or 'downvote'
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (user_id, comment_id),
    CONSTRAINT vote_type_check CHECK (vote_type IN ('upvote', 'downvote'))
);

CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
```

### Phase 4: User Activity & Analytics

#### 11. User Activity (Watch History, Bookmarks)

```sql
CREATE TABLE user_video_activity (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,

    -- Activity types
    has_watched BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ,
    watch_progress_seconds INTEGER DEFAULT 0,  -- Resume functionality

    is_bookmarked BOOLEAN DEFAULT FALSE,
    bookmarked_at TIMESTAMPTZ,

    is_liked BOOLEAN DEFAULT FALSE,
    liked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (user_id, video_id)
);

CREATE INDEX idx_user_activity_user ON user_video_activity(user_id);
CREATE INDEX idx_user_activity_bookmarks ON user_video_activity(user_id, bookmarked_at) WHERE is_bookmarked = true;
CREATE INDEX idx_user_activity_watched ON user_video_activity(user_id, last_watched_at) WHERE has_watched = true;
```

### Phase 5: Semantic Search (pgvector)

#### 12. Video Embeddings

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Store embeddings for semantic search
CREATE TABLE video_embeddings (
    video_id UUID PRIMARY KEY REFERENCES videos(id) ON DELETE CASCADE,

    -- Embedding vector (OpenAI ada-002: 1536 dimensions, or custom model)
    embedding vector(1536),  -- Adjust dimension based on your model

    -- Metadata about embedding generation
    model TEXT NOT NULL,  -- 'openai-ada-002', 'sentence-transformers', etc.
    source TEXT NOT NULL,  -- 'title_description', 'transcript', 'combined'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity index (HNSW for fast approximate search)
CREATE INDEX idx_video_embeddings_vector ON video_embeddings
USING hnsw (embedding vector_cosine_ops);

-- Alternative: IVFFlat index (faster build, slightly slower query)
-- CREATE INDEX idx_video_embeddings_vector ON video_embeddings
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## Database Functions & Triggers

### 1. Auto-update `updated_at` Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_contexts_updated_at BEFORE UPDATE ON video_contexts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Update Comment Vote Counts

```sql
CREATE OR REPLACE FUNCTION update_comment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
        ELSE
            UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
            UPDATE comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.comment_id;
        ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
            UPDATE comments SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.comment_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
        ELSE
            UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_vote_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON comment_votes
FOR EACH ROW EXECUTE FUNCTION update_comment_vote_count();
```

---

## Common Queries

### 1. Get Videos with Full Metadata

```sql
SELECT
    v.*,
    c.name as category_name,
    c.slug as category_slug,
    u.username as submitted_by_username,
    u.display_name as submitted_by_display_name,
    ARRAY_AGG(DISTINCT t.name) as tags
FROM videos v
LEFT JOIN categories c ON v.category_id = c.id
LEFT JOIN users u ON v.submitted_by = u.id
LEFT JOIN video_tags vt ON v.id = vt.video_id
LEFT JOIN tags t ON vt.tag_id = t.id
WHERE v.moderation_status = 'approved'
GROUP BY v.id, c.id, u.id
ORDER BY v.created_at DESC
LIMIT 20;
```

### 2. Full-Text Search

```sql
SELECT
    v.*,
    ts_rank(to_tsvector('english', v.title || ' ' || COALESCE(v.description, '')),
            plainto_tsquery('english', $1)) as rank
FROM videos v
WHERE to_tsvector('english', v.title || ' ' || COALESCE(v.description, ''))
      @@ plainto_tsquery('english', $1)
  AND v.moderation_status = 'approved'
ORDER BY rank DESC
LIMIT 20;
```

### 3. Semantic Similarity Search (pgvector)

```sql
-- Find videos similar to a given video
SELECT
    v.*,
    1 - (ve.embedding <=> target.embedding) as similarity
FROM videos v
JOIN video_embeddings ve ON v.id = ve.video_id
CROSS JOIN (
    SELECT embedding FROM video_embeddings WHERE video_id = $1
) as target
WHERE v.id != $1
ORDER BY ve.embedding <=> target.embedding
LIMIT 10;
```

### 4. Get Video References (Related Videos)

```sql
-- Find all videos referenced by a given video
SELECT
    v.*,
    vr.reference_type,
    vr.note
FROM video_references vr
JOIN videos v ON vr.target_video_id = v.id
WHERE vr.source_video_id = $1
ORDER BY vr.reference_type, v.title;
```

### 5. Find Prerequisite Chain (Recursive)

```sql
WITH RECURSIVE prerequisites AS (
    -- Base case: direct prerequisites
    SELECT
        vr.target_video_id as video_id,
        1 as depth,
        ARRAY[vr.source_video_id] as path
    FROM video_references vr
    WHERE vr.source_video_id = $1
      AND vr.reference_type = 'prerequisite'

    UNION ALL

    -- Recursive case: prerequisites of prerequisites
    SELECT
        vr.target_video_id,
        p.depth + 1,
        p.path || vr.source_video_id
    FROM prerequisites p
    JOIN video_references vr ON p.video_id = vr.source_video_id
    WHERE vr.reference_type = 'prerequisite'
      AND p.depth < 5  -- Limit depth to prevent infinite loops
      AND NOT (vr.source_video_id = ANY(p.path))  -- Prevent cycles
)
SELECT DISTINCT
    v.*,
    p.depth
FROM prerequisites p
JOIN videos v ON p.video_id = v.id
ORDER BY p.depth, v.title;
```

### 6. Get Threaded Comments

```sql
-- Get top-level comments with reply counts
SELECT
    c.*,
    u.username,
    u.avatar_url,
    COUNT(replies.id) as reply_count
FROM comments c
JOIN users u ON c.user_id = u.id
LEFT JOIN comments replies ON c.id = replies.parent_id AND replies.is_deleted = false
WHERE c.video_id = $1
  AND c.parent_id IS NULL
  AND c.is_deleted = false
GROUP BY c.id, u.id
ORDER BY (c.upvotes - c.downvotes) DESC, c.created_at DESC
LIMIT 20;
```

---

## Supabase Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region closest to your users
4. Save your database password securely

### 2. Enable pgvector Extension

```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Run Migrations

Execute the schema SQL above in Supabase SQL Editor in this order:
1. Enable pgvector extension
2. Create core tables (users, categories, videos, tags)
3. Create context tables
4. Create discussion tables
5. Create activity tables
6. Create embeddings table
7. Create triggers and functions

### 4. Set up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_contexts ENABLE ROW LEVEL SECURITY;

-- Example policies
-- Videos: Anyone can read approved videos
CREATE POLICY "Videos are viewable by everyone"
ON videos FOR SELECT
USING (moderation_status = 'approved');

-- Videos: Authenticated users can submit
CREATE POLICY "Authenticated users can submit videos"
ON videos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

-- Comments: Anyone can read
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (is_deleted = false);

-- Comments: Authenticated users can post
CREATE POLICY "Authenticated users can post comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Comments: Users can edit their own
CREATE POLICY "Users can edit own comments"
ON comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

### 5. Environment Variables

```bash
# .env.local (frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# .env (backend)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here  # For admin operations
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

---

## Migration Strategy

### Option 1: SQL Files (Recommended for Version Control)

```bash
mkdir -p backend/migrations
```

**File: `backend/migrations/001_initial_schema.sql`**
- Core tables (users, videos, categories, tags)

**File: `backend/migrations/002_context_layer.sql`**
- Context tables (video_contexts, video_references, collections)

**File: `backend/migrations/003_discussion_layer.sql`**
- Discussion tables (comments, comment_votes)

**File: `backend/migrations/004_pgvector.sql`**
- Enable pgvector, create embeddings table

**File: `backend/migrations/005_triggers.sql`**
- Triggers and functions

### Option 2: Alembic (Python Migrations)

```bash
pip install alembic
alembic init alembic
```

Configure `alembic.ini` and create migrations:
```bash
alembic revision -m "initial schema"
alembic upgrade head
```

---

## Performance Optimization

### Indexes Created

✅ All foreign keys indexed
✅ Common query patterns indexed (created_at DESC, category, platform)
✅ Full-text search index on videos
✅ Vector similarity index (HNSW) on embeddings
✅ Composite indexes for junction tables

### Query Optimization Tips

1. **Use `EXPLAIN ANALYZE`** to understand query performance
2. **Pagination:** Use cursor-based pagination for large result sets
3. **Caching:** Cache common queries (categories, featured videos) in Redis
4. **Connection pooling:** Use pgBouncer for connection pooling
5. **Materialized views:** For complex aggregations (trending videos)

### Example: Materialized View for Trending Videos

```sql
CREATE MATERIALIZED VIEW trending_videos AS
SELECT
    v.*,
    COUNT(DISTINCT c.id) as comment_count,
    COUNT(DISTINCT uva.user_id) as recent_view_count,
    (COUNT(DISTINCT c.id) * 0.3 + COUNT(DISTINCT uva.user_id) * 0.7) as trending_score
FROM videos v
LEFT JOIN comments c ON v.id = c.video_id
    AND c.created_at > NOW() - INTERVAL '7 days'
LEFT JOIN user_video_activity uva ON v.id = uva.video_id
    AND uva.last_watched_at > NOW() - INTERVAL '7 days'
WHERE v.moderation_status = 'approved'
GROUP BY v.id
ORDER BY trending_score DESC;

CREATE INDEX idx_trending_videos_score ON trending_videos(trending_score DESC);

-- Refresh periodically (via cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY trending_videos;
```

---

## Backup Strategy

### Supabase (Automated)
- Daily automated backups (included in all plans)
- Point-in-time recovery (Pro plan)

### Self-Hosted PostgreSQL
```bash
# Daily backup script
pg_dump -U postgres magna_galactica > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres magna_galactica < backup_20251117.sql
```

---

## Future Considerations

### When to Add Neo4j

Consider adding Neo4j as a complementary graph database when:

✅ You have 50k+ videos with complex interconnections
✅ Graph traversal queries (>3 hops) become slow
✅ You need advanced recommendation algorithms
✅ Real-time knowledge graph visualization is required

**Hybrid approach:**
- Keep PostgreSQL for structured data (users, metadata, comments)
- Add Neo4j for relationships and graph queries
- Sync video nodes between databases

---

## Success Criteria

- [ ] Database schema deployed to Supabase
- [ ] pgvector extension enabled
- [ ] All tables created with proper indexes
- [ ] Row Level Security policies configured
- [ ] Seed data added (categories, initial tags)
- [ ] Connection from backend confirmed
- [ ] Connection from frontend (via Supabase client) confirmed
- [ ] Sample queries tested and performant

---

## Next Steps

1. Create Supabase project
2. Run schema migrations
3. Set up RLS policies
4. Seed initial data (categories)
5. Configure backend connection
6. Configure frontend Supabase client
7. Test basic CRUD operations
8. Implement video submission flow
