import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --- Sora Downloader API ---
app.post("/api/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL missing" });
    }

    console.log("Fetching Sora page:", url);
    const html = await fetch(url).then(r => r.text());

    // Extract MP4 URL
    const match = html.match(/https:\/\/[^"]+\.mp4/g);

    if (!match) {
      return res.status(403).json({ error: "Unable to extract video URL" });
    }

    const videoUrl = match[0];
    console.log("Video URL:", videoUrl);

    const video = await fetch(videoUrl);

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sora-video.mp4"
    );

    video.body.pipe(res);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Render port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
