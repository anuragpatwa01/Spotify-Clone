console.log("Let's do JS");

let currentSong = new Audio();
let songs;
let currfolder;


async function getSongs(folder) {
    let response = await fetch("/songs/songs.json");  // Load JSON data
    let albums = await response.json();

    let album = albums.find(a => a.folder === folder); // Find the selected album
    if (!album || !album.songs || album.songs.length === 0) {
        console.error(`No songs found in folder: ${folder}`);
        return;
    }
    songs = album.songs.map(song => song.url);
    //Attach songs to the library section
    let songUl = document.querySelector(".songsList").getElementsByTagName("ol")[0]
    songUl.innerHTML = ""

    let songUrls = album.songs.map(song => song.url); // Store song URLs

    album.songs.forEach(song => {
        let songName = song.url.split('/').pop().replace(/\.[^/.]+$/, "");  // Extract title

        songUl.innerHTML += `
        <li data-url="${song.url}">
            <div class="info"><div>${songName}</div></div>  <!-- Shows only the song title -->
            <div class="playnow"><span>Play Now</span></div>
        </li>`;
    });
    document.querySelectorAll(".songsList li").forEach(item => {
        item.addEventListener("click", () => {
            playMusic(item.dataset.url);
        });
    });

    if (songs.length > 0) {
        playMusic(songs[0]);
        document.querySelectorAll(".songsList li").forEach(item => {
            item.addEventListener("click", () => {
                playMusic(item.dataset.url);
            });
        });

        if (songs.length > 0 && folder !== "/songs/") {
            playMusic(songs[0]);
        }

    }
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0)
        return "00:00"
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(secs.toFixed(0)).padStart(2, '0');
    return `${formattedMinutes}.${formattedSeconds}`;
}




const playMusic = (track, pause = false) => {
    // currentSong.src = `/${currfolder}/` + track; // local machine
    console.log("Playing:", track);  // Debugging log
    currentSong.src = track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }else {
        play.src = "img/play.svg";  // Ensure play button is correct when paused
    }

    let songInfo = document.querySelector(".songinfo");
    let songTitle = track.split('/').pop().replace(/\.[^/.]+$/, ""); // Extract filename without extension
    songInfo.innerHTML = songTitle; songInfo.style.width = "200px";
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    // let a = await fetch(`http://127.0.0.1:3000/songs/`) // local machine
    // let a = await fetch(`./songs/`)
    // let response = await a.text();
    // console.log(response);
    let response = await fetch("/songs/songs.json");  // Load album data from JSON [new]
    let albums = await response.json(); //[new]

    // let div = document.createElement("div")
    // div.innerHTML = response;

    // let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    cardContainer.innerHTML = ""; // Clear previous albums  //[new]

    //let array = Array.from(anchors)

    // if (array.length == 0)  return; // No albums available
    // let firstAlbumFolder = null; // Store the first album folder name

    // for (let index = 0; index < array.length; index++) {
    //     const e = array[index];
    //     if (e.href.includes("/songs")) {
    //         let folder = e.href.split("/").slice(-2)[0];

    //         if (!firstAlbumFolder) {
    //             firstAlbumFolder = folder; // Store the first album folder
    //         }

    //         let albumData = await fetch(`./songs/${folder}/info.json`);
    //         let response = await albumData.json();
    //         //Get the metadata of the folder
    //         // let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)  // local machine
    //         //let response = await a.json();
    //         cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
    //                         <div class="play">
    //                        <img src="img/play.svg" alt="">
    //                         </div>
    //                         <img src="./songs/${folder}/cover.jpeg" alt="">
    //                         <h2>${response.title}</h2>
    //                         <p>${response.description}</p>
    //                     </div>
    //                     `
    //     }
    // }

    albums.forEach(album => {
        cardContainer.innerHTML += `<div data-folder="${album.folder}" class="card">
            <div class="play"><img src="img/play.svg" alt=""></div>
            <img src="${album.cover}" alt="">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    });

    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async () => {
            await getSongs(e.dataset.folder);
        });
    });

    if (albums.length > 0) {
        await getSongs(albums[0].folder); // Auto-load first album
    }

}


async function main() {
    // Get the list of all the songs
    window.addEventListener("load", () => {
        play.src = "img/play.svg"; // Ensure play button shows "Play" on load
    });
    

    await getSongs("/songs/");
    play.src = "img/play.svg"
    // playMusic(songs[0], true)

    //Attach an event listener to play, next & previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }

    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })
    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;

    })

    //Add an event listenser to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listenser to close btn
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listener to previous
    previous.addEventListener("click", () => {
        let currentSongUrl = decodeURIComponent(currentSong.src.split('/').pop()); // Extract filename
        let index = songs.findIndex(song => decodeURIComponent(song.split('/').pop()) === currentSongUrl);

        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let currentSongUrl = decodeURIComponent(currentSong.src.split('/').pop()); // Extract filename
        let index = songs.findIndex(song => decodeURIComponent(song.split('/').pop()) === currentSongUrl);

        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });
    // Automatically play the next song when the current song ends
    currentSong.addEventListener("ended", () => {
        let currentSongUrl = decodeURIComponent(currentSong.src.split('/').pop()); // Extract filename
        let index = songs.findIndex(song => decodeURIComponent(song.split('/').pop()) === currentSongUrl);
    
        if (index !== -1 && index < songs.length - 1) {
            playMusic(songs[index + 1]); // Play next song
        }
    });
    

    //Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    //Add an event listener to mute the track
    document.querySelector(".vol>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }

    })

    // Pause/Play song when the spacebar is pressed
    document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            event.preventDefault(); // Prevents page scrolling when Spacebar is pressed
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/play.svg";
            }
        }
    });





    displayAlbums()


}


main()
