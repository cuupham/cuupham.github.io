
document.addEventListener('DOMContentLoaded', function () {
    setVolume("low-volume", 0.9);
    setVolume("loud-volume", 0.5);

    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.addEventListener('play', function () {
            pauseOtherVideos(video);
        });


    });
});

function setVolume(className, volume) {
    const videos = document.querySelectorAll('.' + className);

    videos.forEach(video => {
        video.volume = volume;
    });
}

function pauseOtherVideos(currentVideo) {
    const videos = document.querySelectorAll('video');

    videos.forEach(video => {
        if (video !== currentVideo && !video.paused) {
            video.pause();
        }
    });
}


async function checkTikTokUrl(url) {
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

function checkYoutubeUrl(url) {

}

function downloadYoutubeVideo() {
    let url_youtube = document.getElementById("url_youtube").value

    // checkYoutubeUrl(url_youtube)
    //     .then(result => {
    //         if (result) {
    //             //alert('ok')
    //             downloadVideo(url_youtube,"youtube")
    //         } else {
    //             //alert('URL không hợp lệ')
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Xảy ra lỗi khi kiểm tra URL:', error);
    //         alert('Xảy ra lỗi khi kiểm tra URL:', error)
    //     });

    alert("Tinh nang dang phat trien")
}

function downloadTiktokVideo() {
    let url_tiktok = document.getElementById("url_tiktok").value

    checkTikTokUrl(url_tiktok)
        .then(result => {
            if (result) {
                //alert('ok')
                downloadVideo(url_tiktok, "tiktok")
            } else {
                alert('URL không hợp lệ')
            }
        })
        .catch(error => {
            console.error('Xảy ra lỗi khi kiểm tra URL:', error);
            alert('Xảy ra lỗi khi kiểm tra URL:', error)
        });
}



function downloadVideo(videoUrl, platform) {
    // Kiểm tra và xử lý tải video từ URL dựa trên nền tảng (Youtube hoặc Tiktok)
    if (platform === "youtube") {
        // Xử lý tải video từ Youtube
        alert("Downloading video from Youtube: " + videoUrl);
        // Chạy hàm với URL cần tải xuống
        processYoutube(videoUrl)

    } else if (platform === "tiktok") {
        // Xử lý tải video từ Tiktok
        alert("Downloading video from Tiktok: " + videoUrl);
        // Chạy hàm với URL cần tải xuống
        processTikTok(videoUrl)
    } else {
        // Nền tảng không hợp lệ
        alert("Invalid platform!");
    }
}

function processTikTok(url) {
    // Step 1: Mở newtab trong chế độ ẩn danh và truy cập URL https://snaptik.app/
    const newTab = window.open('https://snaptik.app/', '_blank', 'noopener,noreferrer');

    // Step 2: Chờ cho trang snaptik.app load hoàn tất
    newTab.onload = function () {
        // Step 3: Lấy đối tượng input trên trang snaptik.app
        const inputElement = newTab.document.getElementById('url');
        if (inputElement) {
            // Step 4: Lấy giá trị URL từ input trên page download.html của bạn
            const urlToPaste = document.getElementById('url_tiktok').value;

            // Step 5: Gán giá trị URL vào input trên trang snaptik.app
            inputElement.value = urlToPaste;
        } else {
            console.error('Input element not found on the page.');
        }
    };
}


