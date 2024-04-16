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
