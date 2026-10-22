const express = require('express');
const cors = require('cors');
const { Innertube } = require('youtubei.js');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'Arama terimi yok' });
        
        const yt = await Innertube.create();
        const search = await yt.music.search(query, { type: 'song' });
        
        const results = search.songs.contents.map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artists ? song.artists[0].name : 'Bilinmeyen',
            thumbnail: song.thumbnails[0].url
        }));
        
        res.json({ status: 'success', results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
