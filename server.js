import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();
app.use(express.json());
app.use(cors());

// Extract MP4 Link from Sora page
async function extractSoraVideo(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
  });

  if (!res.ok) {
    throw new Error("Sora responded with status: " + res.status);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Direct <video><source src="...">
  const videoTag = $("video source").attr("src");
  if (videoTag) return videoTag;

  // Fallback: find any .mp4 URL in HTML
  const jsonData = html.match(/https:\/\/.*?\.mp4/g);
  if (jsonData && jsonData.length > 0) return jsonData[0];

  throw new Error("Could not find video file on Sora page");
}

app.post("/api/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.includes("sora")) {
      return res.status(400).json({ error: "Invalid Sora URL" });
    }

    const mp4Link = await extractSoraVideo(url);

    const videoResponse = await fetch(mp4Link);
    const buffer = Buffer.from(await videoResponse.arrayBuffer());

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sora-video.mp4"
    );

    res.send(buffer);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Unknown error occurred" });
  }
});

app.listen(10000, () => {
  console.log("Sora extractor backend running on port 10000");
});
