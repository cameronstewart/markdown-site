---
description: Fetch YouTube transcript and create a summary article
---

# YouTube Transcript & Summary Generator

You are helping to fetch a YouTube video transcript and create a summary article for the markdown blog site.

## Instructions

1. **Get the YouTube URL from the user** (they will provide it in the chat)

2. **Fetch the transcript** using the npm script:
   ```bash
   npm run transcript <youtube-url>
   ```

3. **Read the generated transcript file** from content/blog/

4. **Create a well-structured summary article** that includes:
   - A compelling title based on the video content
   - A brief introduction/overview
   - Key points and main topics covered
   - Important quotes or insights (if applicable)
   - A conclusion or takeaways section
   - Link to the original video

5. **Update the markdown file** with:
   - Better title and description in frontmatter
   - Well-organized summary content
   - Appropriate tags
   - Keep the full transcript at the bottom for reference

6. **Set published: true** in the frontmatter

7. **Sync the post** to the database:
   ```bash
   npm run sync
   ```

## Guidelines

- Make the summary engaging and informative
- Use proper markdown formatting with headers, lists, and quotes
- Extract the most valuable insights from the transcript
- Keep the original transcript as an appendix
- Use appropriate tags for better discoverability

## Example workflow

```bash
# 1. Fetch transcript
npm run transcript https://youtu.be/VIDEO_ID

# 2. Read and enhance the generated file
# (Claude will read the file and improve it)

# 3. Sync to database
npm run sync
```
