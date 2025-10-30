/* ----- audio core ----- */
const audio = new Audio();

const playerFooter = document.getElementById("audio-player");

const progressContainer = document.getElementById("progressContainer");
const progressBar       = document.getElementById("progressBar");
const currentTimeEl     = document.getElementById("currentTime");
const totalTimeEl       = document.getElementById("totalTime");

const albumArt  = document.getElementById("albumArt");
const songTitle = document.getElementById("songTitle");
const albumTitle= document.getElementById("albumTitle");

const playPauseBtn = document.getElementById("playPause");
const stopBtn = document.getElementById("stop");
const playIcon  = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");

const dropdownToggle = document.getElementById("dropdownToggle");
const dropdownMenu   = document.getElementById("dropdownMenu");
const dropdownChevron= document.getElementById("dropdownChevron");
const versionImage   = document.getElementById("versionImage");
const versionLabel   = document.getElementById("versionLabel");

const chevron = document.getElementById("dropdownChevron");

let audioVersions = [];      // [{name, mp3, ogg}]
let currentVersionIndex = 0; // which is playing now



function chevron_closer(chevron) {
    if (dropdownMenu.classList.contains("visible")) {
        chevron.classList.add("fa-chevron-up");
        chevron.classList.remove("fa-chevron-down");
    } else {
        chevron.classList.add("fa-chevron-down");
        chevron.classList.remove("fa-chevron-up");
    }
};

/* ----- helpers ----- */
function getVersionImage(name){
    const n=(name||"").toLowerCase();
    const img = document.getElementById("versionImage");

    if(n.includes("vocal")) {
        img.classList.add("vocal");
        img.classList.remove("backing");
        img.classList.remove("other");
        return "./img/audio-type/vocal.png";
    } else if (n.includes("instrumental")) {
        img.classList.add("backing");
        img.classList.remove("vocal");
        img.classList.remove("other");
        return "./img/audio-type/instrumental.png";
    } else {
        img.classList.add("other");
        img.classList.remove("vocal");
        img.classList.remove("backing");
        return "./img/audio-type/other.png";
    }
}

function fmt(sec) { 
    if(isNaN(sec)) 
        return "0:00"; 
        const m=Math.floor(sec/60), s=Math.floor(sec%60); 
        return `${m}:${s.toString().padStart(2,"0")}`;
    }

function updateDropdownLabel(name){
    versionLabel.textContent = name || "Version";
    versionImage.src = getVersionImage(name);
    versionImage.alt = name || "Audio type";
}

/* ----- dropdown build ----- */
function buildDropdownMenu(){
    dropdownMenu.innerHTML = `
        ${audioVersions.map((v,i)=>`
            
        <button class="version-btn" data-index="${i}">
            <div class="left">
            <img class="audio-type-icon" src="${getVersionImage(v.name)}" alt="${v.name}">
            <span>${v.name}</span>
            </div>
            <i class="fa-solid fa-download download-icon" data-index="${i}" title="Download ${v.name}"></i>
        </button><hr>
        `).join("")}
        <button id="downloadAll" class="version-btn">
        <div class="left"><i class="fa-solid fa-file-zipper downloadAllZip"></i><span>Download All (ZIP)</span></div>
        </button>
    `;

    // per-version download (name: "Song (Version).mp3")
    dropdownMenu.querySelectorAll(".download-icon").forEach(icon=>{
        icon.addEventListener("click", async e=>{
            e.stopPropagation();
            const i = parseInt(icon.dataset.index,10);
            await downloadAudioVersion(i);
        });
    });

    // switch version
    dropdownMenu.querySelectorAll("button[data-index]").forEach(btn=>{
        btn.addEventListener("click", e=>{
            const i=parseInt(e.currentTarget.dataset.index,10);
            currentVersionIndex=i;
            loadAudioVersion(i);
            dropdownMenu.classList.remove("visible");
            chevron_closer(chevron);
        });
    });


    

    // zip all
    dropdownMenu.querySelector("#downloadAll").addEventListener("click", downloadAllAsZip);
}





/* ----- downloads ----- */
async function downloadAudioVersion(index) {
    const v = audioVersions[index];
    const cleanTitle = songTitle.textContent.trim().replace(/[\\/:*?"<>|]/g,"");
    const fileName = `${cleanTitle} (${v.name}).mp3`;
    const res = await fetch(v.mp3);
    if(!res.ok) throw new Error("Fetch failed");
    const blob = await res.blob();
    saveAs(blob,fileName);
}

async function downloadAllAsZip(){
    if(!audioVersions.length) return;
    const zip = new JSZip();
    const cleanTitle = songTitle.textContent.trim().replace(/[\\/:*?"<>|]/g,"") || "Audio";
    for(const v of audioVersions) {
        const res = await fetch(v.mp3);
        const blob = await res.blob();
        zip.file(`${cleanTitle} (${v.name}).mp3`, blob);
    }
    const out = await zip.generateAsync({type:"blob"});
    saveAs(out, `${cleanTitle}.zip`);
}

/* ----- loading & playback ----- */
function loadAudioVersion(index) {
    const v = audioVersions[index];
    audio.src = v.mp3;    // prefer mp3; you can swap to ogg if needed
    // audio.play();
    
    updateDropdownLabel(v.name);

    stopPlayer();
}



async function loadSong(id) {
    const res = await fetch(`json/${id}.json`);   // expects your shape
    const data = await res.json();
    const song = data.data.song;

    // map versions to local paths
    audioVersions = (song.audios || []).map(a=>({
        name: a.infoName,
        mp3: `./resources/audio/mp3/file_audio_${a.id}.mp3`,
        ogg: `./resources/audio/ogg/file_audio_${a.id}.ogg`,
        versionduration: a.millisecondsLength
    }));

    // titles/art
    songTitle.textContent  = song.infoName || "Unknown Song";
    albumTitle.textContent = (song.esongbooks?.[0]?.infoName) || "";
    albumArt.src           = song.albumArt || (song.esongbooks?.[0]?.albumArt) || "img/artwork-missing.jpg";



    buildDropdownMenu();

    loadAudioVersion(0);
    playerFooter.classList.remove("hidden");    

    currentVersionIndex = 0;
    loadAudioVersion(currentVersionIndex);
    updateDropdownLabel(audioVersions[currentVersionIndex].name);

    
}

/* ----- UI events ----- */
playPauseBtn.addEventListener("click", ()=>{
    if(audio.paused){ 
        audio.play();  
        playIcon.classList.add("hidden"); 
        pauseIcon.classList.remove("hidden"); 
    }
    else { 
        audio.pause(); 
        pauseIcon.classList.add("hidden"); 
        playIcon.classList.remove("hidden"); 
    }
});


stopBtn.addEventListener("click", () => {
    stopPlayer()
});



audio.addEventListener("timeupdate", ()=>{
    if(!isNaN(audio.duration)){
        progressBar.style.width = `${(audio.currentTime / audio.duration)*100}%`;
        currentTimeEl.textContent = fmt(audio.currentTime);
        totalTimeEl.textContent   = fmt(audio.duration);
    }
});


audio.addEventListener("ended", ()=>{
    pauseIcon.classList.add("hidden"); 
    playIcon.classList.remove("hidden");
    audio.currentTime = 0;
});

progressContainer.addEventListener("click", (e)=>{
    const rect = progressContainer.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if(!isNaN(audio.duration)) audio.currentTime = ratio * audio.duration;
});

/* dropdown open/close */
dropdownToggle.addEventListener("click", ()=>{
    dropdownMenu.classList.toggle("visible");
    chevron_closer(chevron);
});

document.addEventListener("click", (e)=>{
    if(!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)){
        dropdownMenu.classList.remove("visible");
        chevron_closer(chevron);
    }
});

/* ----- example: load a song by query param ?song=10 ----- */
// document.querySelectorAll(".play-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//         sondId = document.getElementById("AudioBtn")
//         loadSong(songId);
//     });
// });

document.addEventListener("click", e => {
  const btn = e.target.closest(".play-btn");
  if (!btn) return;

  const songId = btn.dataset.song;
  if (!songId) return;

  // show the player (if hidden)
//   document.getElementById("audioPlayerBar").style.display = "block";

  // load and play the song
  loadSong(songId);
});

function stopPlayer() {
    audio.pause();
    audio.currentTime = 0.0000001;
    pauseIcon.classList.add("hidden");
    playIcon.classList.remove("hidden");
}

