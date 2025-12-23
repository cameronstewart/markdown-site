import fs from "fs";
import path from "path";
import { YoutubeTranscript } from "youtube-transcript";

// Extract video ID from various YouTube URL formats
function extractVideoId(input: string): string | null {
  // Handle direct video IDs
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);

    // Handle youtu.be short links
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("?")[0];
    }

    // Handle youtube.com links
    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

// Generate a URL-safe slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .substring(0, 60); // Limit length
}

// Format transcript text
function formatTranscript(transcript: any[]): string {
  return transcript
    .map((entry) => entry.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// Format transcript with timestamps
function formatTranscriptWithTimestamps(transcript: any[]): string {
  return transcript
    .map((entry) => {
      const minutes = Math.floor(entry.offset / 60000);
      const seconds = Math.floor((entry.offset % 60000) / 1000);
      const timestamp = `[${minutes}:${seconds.toString().padStart(2, "0")}]`;
      return `${timestamp} ${entry.text}`;
    })
    .join("\n");
}

async function fetchYoutubeTranscript(input: string, options: {
  includeTimestamps?: boolean;
  saveRaw?: boolean;
  title?: string;
} = {}) {
  const videoId = extractVideoId(input);

  if (!videoId) {
    console.error("Error: Could not extract video ID from input");
    console.log("Please provide a valid YouTube URL or video ID");
    process.exit(1);
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log(`\nFetching transcript for: ${videoUrl}`);
  console.log("This may take a moment...\n");

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      console.error("No transcript found for this video");
      console.log("The video may not have captions/subtitles available.");
      process.exit(1);
    }

    // Format the transcript
    const formattedTranscript = options.includeTimestamps
      ? formatTranscriptWithTimestamps(transcript)
      : formatTranscript(transcript);

    // Generate title and slug
    const title = options.title || `YouTube Video Transcript - ${videoId}`;
    const slug = generateSlug(title);
    const today = new Date().toISOString().split("T")[0];

    // Create markdown file with frontmatter
    const markdown = `---
title: "${title.replace(/"/g, '\\"')}"
description: "Transcript from YouTube video ${videoId}"
date: "${today}"
slug: "${slug}"
published: false
tags: ["youtube", "transcript"]
---

# ${title}

**Video URL:** [${videoUrl}](${videoUrl})

## Transcript

${formattedTranscript}

---

*Transcript fetched from YouTube video [${videoId}](${videoUrl})*
`;

    // Ensure content/blog directory exists
    const blogDir = path.join(process.cwd(), "content", "blog");
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    // Write the markdown file
    const filePath = path.join(blogDir, `${slug}.md`);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.warn(`Warning: File already exists at ${filePath}`);
      console.warn("Adding timestamp to filename to avoid overwrite.");
      const newSlug = `${slug}-${Date.now()}`;
      const newFilePath = path.join(blogDir, `${newSlug}.md`);
      fs.writeFileSync(
        newFilePath,
        markdown.replace(`slug: "${slug}"`, `slug: "${newSlug}"`),
      );
      console.log(`\nCreated: ${newFilePath}`);
      console.log(`Slug: ${newSlug}`);
    } else {
      fs.writeFileSync(filePath, markdown);
      console.log(`\nCreated: ${filePath}`);
      console.log(`Slug: ${slug}`);
    }

    // Optionally save raw transcript as JSON
    if (options.saveRaw) {
      const rawPath = path.join(blogDir, `${slug}-raw.json`);
      fs.writeFileSync(rawPath, JSON.stringify(transcript, null, 2));
      console.log(`Raw transcript: ${rawPath}`);
    }

    console.log(`Title: ${title}`);
    console.log(`Video ID: ${videoId}`);
    console.log(`Transcript length: ${formattedTranscript.length} characters`);
    console.log(`Status: Draft (published: false)`);
    console.log("\nNext steps:");
    console.log("1. Review and edit the transcript");
    console.log("2. Add a summary or analysis if needed");
    console.log("3. Set published: true when ready");
    console.log("4. Run: npm run sync");

    return {
      videoId,
      videoUrl,
      transcript: formattedTranscript,
      filePath,
    };
  } catch (error: any) {
    console.error("Error fetching transcript:", error.message || error);
    if (error.message?.includes("Transcript is disabled")) {
      console.log("\nThis video has transcripts/captions disabled.");
    } else if (error.message?.includes("Could not find")) {
      console.log("\nNo transcript/captions available for this video.");
    }
    process.exit(1);
  }
}

// Parse command line arguments
const input = process.argv[2];
const flags = process.argv.slice(3);

const options = {
  includeTimestamps: flags.includes("--timestamps") || flags.includes("-t"),
  saveRaw: flags.includes("--raw") || flags.includes("-r"),
  title: flags.find((f) => f.startsWith("--title="))?.split("=")[1],
};

if (!input) {
  console.log("YouTube Transcript Fetcher");
  console.log("==========================\n");
  console.log("Usage: npm run transcript <url|video-id> [options]\n");
  console.log("Options:");
  console.log("  --timestamps, -t     Include timestamps in transcript");
  console.log("  --raw, -r            Save raw JSON transcript");
  console.log('  --title="Title"      Custom title for the post\n');
  console.log("Examples:");
  console.log("  npm run transcript https://youtu.be/dQw4w9WgXcQ");
  console.log("  npm run transcript dQw4w9WgXcQ --timestamps");
  console.log('  npm run transcript dQw4w9WgXcQ --title="My Video Summary"\n');
  console.log("This will:");
  console.log("  1. Fetch the video transcript");
  console.log("  2. Create a draft post in content/blog/");
  console.log("  3. You can then review, edit, and sync\n");
  process.exit(0);
}

fetchYoutubeTranscript(input, options);
