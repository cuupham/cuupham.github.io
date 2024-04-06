/* -- Xử lý Volume và Pause Video -- */
document.addEventListener('DOMContentLoaded', function () {
    const videos = document.querySelectorAll('video');

    setVolume(videos, "low-volume", 0.9);
    setVolume(videos, "loud-volume", 0.5);


    videos.forEach(video => {
        video.addEventListener('play', function () {
            pauseOtherVideos(video, videos);
        });
    });
});

function setVolume(videos, className, volume) {
    videos.forEach(video => {
        if (video.classList.contains(className)) {
            video.volume = volume;
        }
    });
}

function pauseOtherVideos(currentVideo, allVideos) {
    allVideos.forEach(video => {
        if (video !== currentVideo && !video.paused) {
            video.pause();
        }
    });
}

/* -- Youtube -- */


/* -- Tiktok -- */
async function verifyTikTokUrl(url) {
    try {
        const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7',
                'dnt': '1',
                'origin': 'https://snaptik.app',
                'referer': 'https://snaptik.app/',
                'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
            }
        });

        return response.ok;
    } catch (error) {
        console.error('Fetch error:', error);
        return false;
    }
}
