function setVolume(className, volume) {
    const video_list = document.querySelectorAll('.' + className);

    video_list.forEach(video_list => {
        const videos = video_list.querySelectorAll('video');

        videos.forEach(singleVideo => {
            singleVideo.volume = volume;
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    setVolume("video-container", 0.86);
});
