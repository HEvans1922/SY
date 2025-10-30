const playerFooter = document.getElementById("audio-player");
const playPauseBtn = document.getElementById("playPause");
const stopBtn = document.getElementById("stop");
const seekBar = document.getElementById("seek");
const timeDisplay = document.getElementById("time");
const volumeControl = document.getElementById("volume");
const titleEl = document.getElementById("player-title");
const albumEl = document.getElementById("player-esongbook");
const artEl = document.getElementById("player-art");

const dropdownToggle = document.getElementById("audioDropdownToggle");
const dropdownMenu = document.getElementById("audioDropdownMenu");
const chevron = document.getElementById("dropdownChevron");

let audio = new Audio();
let audioVersions = [];
let currentVersionIndex = 0;

function chevron_closer(chevron) {
    if (dropdownMenu.classList.contains("visible")) {
        chevron.classList.add("fa-chevron-up");
        chevron.classList.remove("fa-chevron-down");
    } else {
        chevron.classList.add("fa-chevron-down");
        chevron.classList.remove("fa-chevron-up");
    }
};


// Dropdown toggle
dropdownToggle.addEventListener("click", () => {
  dropdownMenu.classList.toggle("visible");
  chevron_closer(chevron)
});

document.addEventListener("click", e => {
    if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove("visible");
        chevron_closer(chevron);
    }
});



async function loadSong(songId) {
    // 1️⃣ Fetch JSON file
    const res = await fetch(`json/${songId}.json`);
    const data = await res.json();
    const song = data.data.song;

    // 2️⃣ Build audio version list
    audioVersions = song.audios.map(a => ({
        id: a.id,
        name: a.infoName,
        mp3: `/resources/audio/mp3/file_audio_${a.id}.mp3`,
        ogg: `/resources/audio/ogg/file_audio_${a.id}.ogg`
    }));


    // Update info
    titleEl.textContent = song.infoName;
    albumEl.textContent = song.esongbooks?.[0]?.infoName || "";
    artEl.src = song.albumArt || song.esongbooks?.[0]?.albumArt || "";

    // Build dropdown menu
    buildDropdownMenu();

    // Load first version
    loadAudioVersion(0);
    playerFooter.classList.remove("hidden");

    // ...after setting up audioVersions, etc.
    currentVersionIndex = 0;
    loadAudioVersion(currentVersionIndex);
    updateDropdownLabel(audioVersions[currentVersionIndex].name);
}

// BUILDS THE DROPDOWN SELECTION OF THE SONGS - plus allows you to download by song type or to download all
function buildDropdownMenu() {
    dropdownMenu.innerHTML = `
    ${audioVersions.map((v, i) => `
        <button class="version-btn" data-index="${i}">
        <img class="audio-type-icon" src="${getVersionImage(v.name)}" alt="${v.name}">
        <span>${v.name}</span>
        <i class="fa-solid fa-download download-icon" data-index="${i}" title="Download (${v.name})"></i>
        </button>
    `).join("")}
    <hr>

    <button id="downloadAll">
        <i class="fa-solid fa-file-zipper"></i> Download All (ZIP)
    </button>
    `;

    dropdownMenu.querySelectorAll(".download-icon").forEach(icon => {
        icon.addEventListener("click", e => {
            e.stopPropagation(); // don’t trigger version switching
            const index = parseInt(icon.dataset.index, 10);
            downloadAudioVersion(index);
        });
    });

    dropdownMenu.querySelectorAll("button[data-index]").forEach(btn => {
        btn.addEventListener("click", e => {
            const i = parseInt(e.currentTarget.dataset.index);
            currentVersionIndex = i;
            loadAudioVersion(i);
            dropdownMenu.classList.remove("visible");
            chevron_closer(chevron);
        });
    });

    dropdownMenu.querySelector("#downloadAll").addEventListener("click", downloadAllAsZip);
}

// GETS ALL AUDIO VERSIONS FROM THE JSON FILE
function loadAudioVersion(index) {
    const version = audioVersions[index];
    audio.src = version.mp3;
    
    pauseIcon.classList.add("hidden");
    playIcon.classList.remove("hidden");

    updateDropdownLabel(version.name);
}

// CHANGES THE IMAGE BASED ON THE SONG TYPE
function getVersionImage(name) {
  const n = (name || "").toLowerCase();
    const img = document.getElementById("versionImage");

    if (n.includes("vocal")) {
        img.classList.add("vocal");
        img.classList.remove("backing");
        img.classList.remove("other");
        return "img/audio-type/vocal.png"; 
    } else if (n.includes("instrumental")) {
        img.classList.add("backing");
        img.classList.remove("vocal");
        img.classList.remove("other");
        return "img/audio-type/instrumental.png";
    } else {
        img.classList.add("other");
        img.classList.remove("vocal");
        img.classList.remove("backing");
        return "img/audio-type/other.png";
    }
}

// Changes the image based on song type
function updateDropdownLabel(name) {
    const labelEl = document.getElementById("versionLabel");
    const imgEl = document.getElementById("versionImage");

    labelEl.textContent = name || "Version";
    imgEl.src = getVersionImage(name);
    imgEl.alt = name;
}

// Stop
stopBtn.addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
    pauseIcon.classList.add("hidden");
    playIcon.classList.remove("hidden");
});

// Seek
audio.addEventListener("timeupdate", () => {
    seekBar.value = (audio.currentTime / audio.duration) * 100 || 0;
    timeDisplay.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
});

seekBar.addEventListener("input", () => {
    audio.currentTime = (seekBar.value / 100) * audio.duration;
});

// Volume
volumeControl.addEventListener("input", () => {
    audio.volume = volumeControl.value;
});

function fmt(sec) {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}


async function downloadAudioVersion(index) {
  const version = audioVersions[index];
  const cleanTitle = titleEl.textContent.trim().replace(/[\\/:*?"<>|]/g, "");
  const fileName = `${cleanTitle} (${version.name}).mp3`;


  try {
    const response = await fetch(version.mp3);
    if (!response.ok) throw new Error(`Failed to fetch ${version.mp3}`);
    
    const blob = await response.blob();

    // Use FileSaver.js to trigger a download
    saveAs(blob, fileName);
    console.log(`✅ Downloaded: ${fileName}`);
  } catch (err) {
    console.error(`❌ Failed to download ${fileName}:`, err);
  }
}

// 🔽 Download all MP3s as ZIP
async function downloadAllAsZip() {
    if (!audioVersions.length) return;
    
    const songTitle = titleEl.textContent.trim() || "Song";

    const zip = new JSZip();

    for (const version of audioVersions) {
        const response = await fetch(version.mp3);
        const blob = await response.blob();

        // Make clean, readable filename
        const cleanTitle = songTitle.replace(/[\\/:*?"<>|]/g, ""); // remove illegal file chars
        const fileName = `${cleanTitle} (${version.name}).mp3`;

        zip.file(fileName, blob);
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Save with the song title as filename
    const zipFileName = `${songTitle.replace(/[\\/:*?"<>|]/g, "")}.zip`;
    saveAs(zipBlob, zipFileName);
}

const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");

playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
        playIcon.classList.add("hidden");
        pauseIcon.classList.remove("hidden");
    } else {
        audio.pause();
        pauseIcon.classList.add("hidden");
        playIcon.classList.remove("hidden");
    }
});

audio.addEventListener("ended", () => {
    pauseIcon.classList.add("hidden");
    playIcon.classList.remove("hidden");
});

document.querySelectorAll(".play-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        loadSong(songId);
    });
});