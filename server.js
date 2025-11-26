import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Sora direct download API
app.post("/api/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    // Step 1: Fetch Sora HTML page
    const page = await fetch(url);
    const html = await page.text();

    // Step 2: Extract MP4 link
    const match = html.match(/https:\/\/.*?\.mp4/);

    if (!match) {
      return res.status(403).json({ error: "Failed to extract video URL" });
    }

    const videoUrl = match[0];

    // Step 3: Stream video back to user
    const videoStream = await fetch(videoUrl);

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", "attachment; filename=sora-video.mp4");

    videoStream.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
