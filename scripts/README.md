# Scripts

This directory contains utility scripts for managing the markdown blog site.

## Available Scripts

### 1. YouTube Transcript Fetcher

**File:** `fetch-youtube-transcript.ts`

Fetches transcripts from YouTube videos and creates draft blog posts.

#### Usage

```bash
# Basic usage
npm run transcript <youtube-url>

# With timestamps
npm run transcript <youtube-url> --timestamps

# With custom title
npm run transcript <youtube-url> --title="My Custom Title"

# Save raw JSON transcript
npm run transcript <youtube-url> --raw
```

#### Examples

```bash
# Using full URL
npm run transcript https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Using short URL
npm run transcript https://youtu.be/dQw4w9WgXcQ

# Using video ID only
npm run transcript dQw4w9WgXcQ

# With options
npm run transcript dQw4w9WgXcQ --timestamps --title="Rick Astley Analysis"
```

#### What it does

1. Extracts the video ID from various YouTube URL formats
2. Fetches the video transcript/captions
3. Creates a markdown file in `content/blog/` with:
   - Frontmatter (title, date, slug, tags)
   - Link to the original video
   - Full transcript text
4. Sets the post as draft (`published: false`)

#### Next steps after running

1. Review the generated file in `content/blog/`
2. Edit the content and add a summary/analysis
3. Update the title and description if needed
4. Set `published: true` when ready
5. Run `npm run sync` to publish

### 2. Claude Slash Command

**Command:** `/youtube-summary`

A Claude Code slash command that automates the entire workflow:
1. Fetches the transcript
2. Analyzes the content
3. Creates a well-structured summary article
4. Syncs to the database

#### Usage in Claude Code

```
/youtube-summary
```

Then provide the YouTube URL when prompted. Claude will:
- Fetch the transcript using the script
- Read and analyze the content
- Create a polished summary article
- Add proper formatting and structure
- Sync the post to your blog

### 3. URL Importer

**File:** `import-url.ts`

Imports content from any URL using Firecrawl.

```bash
npm run import <url>
```

### 4. Post Sync

**File:** `sync-posts.ts`

Syncs markdown posts to Convex database.

```bash
npm run sync          # Development
npm run sync:prod     # Production
```

### 5. Fork Configuration

**File:** `configure-fork.ts`

Configure your fork settings.

```bash
npm run configure
```

## Dependencies

- **youtube-transcript**: Fetches YouTube video transcripts
- **firecrawl**: Web scraping for URL imports
- **tsx**: TypeScript execution
- **convex**: Database sync

## Notes

- The YouTube transcript feature requires the video to have captions/subtitles enabled
- Transcripts can be auto-generated or manual
- The script handles various YouTube URL formats automatically
- All posts are created as drafts by default for review
