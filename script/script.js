// DOM Elements
const cards = document.querySelector('.cards');
const songlist = document.querySelector('.songlist');
const songname = document.querySelector('.songname');
const time = document.querySelector('.time');
const backward = document.querySelector('.backward');
const forward = document.querySelector('.forward');
const playPause = document.querySelector('.play');
const volumeIcon = document.querySelector('.volume-icon');
const volumeRange = document.querySelector('input[type="range"]');
const timeline = document.querySelector('.timeline');
const timelineProgress = document.querySelector('.timeline-progress');
const hamburgerMenu = document.querySelector('.hamburger-menu');

// Global Variables
let allSongArray = [];
let currentSong = new Audio();
let isPlaying = false;
let isMuted = false;
let lastVolume = 1;

// Updates the progress bar based on the current time of the song
const updateTimeline = () => {
    const progressPercentage = (currentSong.currentTime / currentSong.duration) * 100;
    timelineProgress.style.width = isNaN(progressPercentage) || progressPercentage === Infinity ? '0%' : `${progressPercentage}%`;
};

// Updates the play/pause button icon
const updatePlayPauseIcon = () => {
    const playIcon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7L8 5z" fill="#fff" /></svg>';
    const pauseIcon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="#fff" /></svg>';
    playPause.innerHTML = isPlaying ? pauseIcon : playIcon;
};

// Updates the volume icon based on whether the audio is muted or not
const updateVolumeIcon = () => {
    const volumeHighIcon = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5v-16l-5 5h-4zm13.5 3c0-1.77-.77-3.29-2-4.31v8.62c1.23-1.02 2-2.54 2-4.31zm-2 6.19v2.02c2.89-1.13 5-3.9 5-7.21s-2.11-6.08-5-7.21v2.02c1.76.97 3 2.92 3 5.19s-1.24 4.22-3 5.19z" /></svg>';
    const volumeMuteIcon = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M16.5 12c0 1.77-.77 3.29-2 4.31v-8.62c1.23 1.02 2 2.54 2 4.31zm3.5 0c0 2.28-1 4.31-2.6 5.74l1.4 1.42c1.94-1.83 3.2-4.42 3.2-7.16s-1.26-5.33-3.2-7.16l-1.4 1.42c1.6 1.43 2.6 3.46 2.6 5.74zm-11.5 6v-16l-5 5h-4v6h4l5 5zm2-18h4v2h-4v-2z"/></svg>';
    volumeIcon.innerHTML = isMuted ? volumeMuteIcon : volumeHighIcon;
};

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Plays a song and updates the UI
const playSong = (audioSrc, songName) => {
    currentSong.src = audioSrc;
    songname.textContent = songName;

    currentSong.play().catch(error => console.error('Error playing the song:', error));
    isPlaying = true;
    updatePlayPauseIcon();
};

currentSong.addEventListener('loadedmetadata', () => {
    if (currentSong.duration === Infinity || isNaN(Number(currentSong.duration))) {
        currentSong.currentTime = 1e101
        currentSong.addEventListener('timeupdate', getDuration)
    }
})

currentSong.addEventListener("timeupdate", () => {
    time.textContent = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    updateTimeline();
});

// Seek bar functionality
timeline.addEventListener("click", (e) => {
    const rect = timeline.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    const percent = offsetX / width;
    console.log(percent * currentSong.duration);
    currentSong.currentTime = percent * currentSong.duration;
    updateTimeline();
});

function getDuration(event) {
    event.target.currentTime = 0;
    event.target.removeEventListener('timeupdate', getDuration);
}

// Toggles play/pause state of the song
const togglePlayPause = () => {
    if (isPlaying) {
        currentSong.pause();
    } else {
        currentSong.play().catch(error => console.error('Error playing the song:', error));
    }
    isPlaying = !isPlaying;
    updatePlayPauseIcon();
};

// Handles backward and forward navigation
const navigateSongs = (direction) => {
    if (allSongArray.length === 0) return;

    const currentIndex = allSongArray[0].indexOf(new URL(currentSong.src).pathname);
    const newIndex = direction === 'backward' ? (currentIndex > 0 ? currentIndex - 1 : allSongArray[0].length - 1) : (currentIndex < allSongArray[0].length - 1 ? currentIndex + 1 : 0);

    const song = allSongArray[0][newIndex];
    const songName = song.split('/').pop().split('.').slice(0, -1).join('.');
    playSong(song, songName);
};

// Volume control
const handleVolumeChange = (event) => {
    const volume = event.target.value / 100;
    currentSong.volume = volume;
    isMuted = volume === 0;
    if (!isMuted) {
        lastVolume = volume;
    }
    updateVolumeIcon();
};

// Toggle mute/unmute
const toggleMute = () => {
    if (isMuted) {
        currentSong.volume = lastVolume;
        volumeRange.value = lastVolume * 100;
    } else {
        lastVolume = currentSong.volume;
        currentSong.volume = 0;
        volumeRange.value = 0;
    }
    isMuted = !isMuted;
    updateVolumeIcon();
};

// Event Listeners
playPause.addEventListener('click', togglePlayPause);
backward.addEventListener('click', () => navigateSongs('backward'));
forward.addEventListener('click', () => navigateSongs('forward'));
volumeIcon.addEventListener('click', toggleMute);
volumeRange.addEventListener('input', handleVolumeChange);

// Fetches and displays albums
const getAlbums = async () => {
    try {
        const res = await fetch('/albums');
        if (!res.ok) throw new Error('Failed to fetch albums');
        const data = await res.text();
        const albumLinks = Array.from(new DOMParser().parseFromString(data, 'text/html').querySelectorAll('a'))
            .map(anchor => anchor.getAttribute('href'))
            .filter(href => href && href.startsWith('/albums/'));

        let htmlContent = '';
        for (const album of albumLinks) {
            try {
                const infoRes = await fetch(`${album}/info.json`);
                if (!infoRes.ok) throw new Error(`Failed to fetch info for album ${album}`);
                const resData = await infoRes.json();
                htmlContent += `
                    <div class="card" data-album="${album}">
                        <img src="${resData.banner}" alt="">
                        <h2>${resData.name}</h2>
                        <p>${resData.singer}</p>
                        <div class="playIcon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5v14l11-7L8 5z" fill="#000" />
                            </svg>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error(`Error fetching album info: ${error.message}`);
            }
        }
        cards.innerHTML = htmlContent;

        // Initialize album data
        const initializeData = async () => {
            const firstAlbum = cards.querySelector('.card').dataset.album;
            const songsRes = await fetch(`${firstAlbum}/songs`);
            const songsData = await songsRes.text();
            const songsArray = Array.from(new DOMParser().parseFromString(songsData, 'text/html').querySelectorAll('a'))
                .map(anchor => anchor.getAttribute('href'))
                .filter(href => href && href.startsWith('/albums/'))
                .filter(href => /\.(mp3|wav|ogg)$/.test(href));
            allSongArray.push(songsArray);
            songlist.innerHTML = songsArray.map(song => {
                const songName = song.split('/').pop().split('.').slice(0, -1).join('.');
                return `
                    <div class="song" data-song="${song}">
                        <div>
                            <img src="/assets/images/music.svg" alt="">
                            <h3>${songName}</h3>
                        </div>
                        <div>
                            <img src="./assets/images/play.svg" alt="">
                        </div>
                    </div>
                `;
            }).join('');

            // Add click event listeners to each song
            songlist.querySelectorAll('.song').forEach(songElement => {
                songElement.addEventListener('click', () => {
                    const song = songElement.dataset.song;
                    const songName = songElement.querySelector('h3').textContent;
                    playSong(song, songName);
                });
            });

            playSong(songsArray[0], songsArray[0].split('/').pop().split('.').slice(0, -1).join('.'));
        };

        initializeData();

        // Add click event listeners to each album
        cards.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', async () => {
                const album = card.dataset.album;
                const songsRes = await fetch(`${album}/songs`);
                const songsData = await songsRes.text();
                const songsArray = Array.from(new DOMParser().parseFromString(songsData, 'text/html').querySelectorAll('a'))
                    .map(anchor => anchor.getAttribute('href'))
                    .filter(href => href && href.startsWith('/albums/'))
                    .filter(href => /\.(mp3|wav|ogg)$/.test(href));

                allSongArray = [songsArray];
                songlist.innerHTML = songsArray.map(song => {
                    const songName = song.split('/').pop().split('.').slice(0, -1).join('.');
                    return `
                        <div class="song" data-song="${song}">
                            <div>
                                <img src="/assets/images/music.svg" alt="">
                                <h3>${songName}</h3>
                            </div>
                            <div>
                                <img src="./assets/images/play.svg" alt="">
                            </div>
                        </div>
                    `;
                }).join('');

                // Add click event listeners to each song
                songlist.querySelectorAll('.song').forEach(songElement => {
                    songElement.addEventListener('click', () => {
                        const song = songElement.dataset.song;
                        const songName = songElement.querySelector('h3').textContent;
                        playSong(song, songName);
                    });
                });

                playSong(songsArray[0], songsArray[0].split('/').pop().split('.').slice(0, -1).join('.'));
            });
        });

    } catch (error) {
        console.error(`Error fetching albums: ${error.message}`);
    }
};

// Initialize the app
getAlbums();

hamburgerMenu.addEventListener('click', () => {
    let aside = document.querySelector('aside');
    aside.style.left = '0px';
});

document.querySelector('.closeIcon').addEventListener('click', () => {
    let aside = document.querySelector('aside');
    aside.style.left = '-130%';
});

// Reset sidebar position on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 1068) {
        document.querySelector('aside').style.left = '0';
    } else {
        document.querySelector('aside').style.left = '-130%';
    }
});
