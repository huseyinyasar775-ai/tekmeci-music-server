const express = require('express');
const cors = require('cors');
const path = require('path');
const YTMusic = require('ytmusic-api').default;
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ytmusic = new YTMusic();
async function initYTMusic() {
    try {
        await ytmusic.initialize();
        console.log('✅ YouTube Music API Başlatıldı');
    } catch (error) {
        console.error('❌ API Başlatma Hatası:', error);
    }
}
initYTMusic();

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'Arama terimi girilmedi' });

        const songs = await ytmusic.searchSongs(query);
        const formattedResults = songs.map(song => ({
            id: song.videoId,
            title: song.name,
            artist: song.artist.name,
            album: song.album ? song.album.name : 'Tekli',
            thumbnail: song.thumbnails[song.thumbnails.length - 1].url
        }));

        res.json({ status: 'success', results: formattedResults });
    } catch (error) {
        console.error('Arama hatası:', error);
        res.status(500).json({ error: 'Arama yapılırken hata oluştu.' });
    }
});

app.get('/api/stream/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        if (!ytdl.validateID(videoId)) {
            return res.status(400).json({ error: 'Geçersiz Şarkı ID' });
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }).pipe(res);

    } catch (error) {
        console.error('Stream hatası:', error);
        res.status(500).json({ error: 'Akış başlatılamadı.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Sunucu Hazır: Port ${PORT}`);
});
