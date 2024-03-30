function setVolume(videoId, volumeLevel) {
    let video = document.getElementById(videoId);
    if (video) {
        video.volume = volumeLevel;
    }
}
