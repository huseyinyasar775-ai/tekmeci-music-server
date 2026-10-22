const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const YTMusic = require('ytmusic-api').default;

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const ytmusic = new YTMusic();

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'Arama terimi yok' });

        // Kütüphane her istekte yeniden başlatılır (hata payını düşürmek için)
        await ytmusic.initialize();
        const songs = await ytmusic.searchSongs(query);
        
        const formattedResults = songs.map(song => ({
            id: song.videoId,
            title: song.name,
            artist: song.artist.name,
            thumbnail: song.thumbnails[song.thumbnails.length - 1].url
        }));

        res.json({ status: 'success', results: formattedResults });
    } catch (error) {
        console.error('Arama Hatası:', error);
        res.status(500).json({ status: 'error', results: [] });
    }
});

app.get('/api/stream/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        if (!ytdl.validateID(videoId)) {
            return res.status(400).json({ error: 'Geçersiz ID' });
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }).pipe(res);
    } catch (error) {
        res.status(500).json({ error: 'Akış hatası' });
    }
});

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
