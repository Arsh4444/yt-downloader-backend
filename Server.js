// ✅ YouTube Downloader Backend for Railway (Ready-to-Upload)
// Easy, non-tech friendly, no config required

const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('YouTube Downloader Backend is Running ✅');
});

// Endpoint to get video info and available formats
app.get('/video-info', async (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) return res.status(400).json({ error: 'URL is required' });
    try {
        const info = await ytdl.getInfo(videoURL);
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio')
            .map(format => ({
                quality: format.qualityLabel,
                itag: format.itag,
                container: format.container
            }))
            .filter((v, i, a) => v.quality && a.findIndex(t => t.quality === v.quality) === i);
        res.json({ title: info.videoDetails.title, formats });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch video info', details: err.message });
    }
});

// Endpoint to download video
app.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    const itag = req.query.itag;

    if (!videoURL || !itag) return res.status(400).json({ error: 'URL and itag are required' });
    try {
        const info = await ytdl.getInfo(videoURL);
        const format = ytdl.chooseFormat(info.formats, { quality: itag });
        const title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, ''); // Clean title
        res.header('Content-Disposition', `attachment; filename="${title}.${format.container}"`);
        ytdl(videoURL, { format: format }).pipe(res);
    } catch (err) {
        res.status(500).json({ error: 'Download failed', details: err.message });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
