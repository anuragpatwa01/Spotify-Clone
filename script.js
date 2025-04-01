console.log("Let's do JS");

let currentSong = new Audio();
let songs;
let currfolder;

async function getSongs(folder) {
    currfolder = folder
    // let a = await fetch(`http://127.0.0.1:3000/${folder}/`)  // local machine
    let a = await fetch(`./${folder}/`)

    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            console.log(element.href.split(`/${folder}/`));

            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }




    //Attach songs to the library section
    let songUl = document.querySelector(".songsList").getElementsByTagName("ol")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div></div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>`
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
    return songs
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
    currentSong.src = `./${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    let songInfo = document.querySelector(".songinfo");
    songInfo.innerHTML = decodeURI(track);
    songInfo.style.width = "200px";
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    // let a = await fetch(`http://127.0.0.1:3000/songs/`) // local machine
    let a = await fetch(`./songs/`)
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    if (array.length == 0)  return; // No albums available
    let firstAlbumFolder = null; // Store the first album folder name

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            if (!firstAlbumFolder) {
                firstAlbumFolder = folder; // Store the first album folder
            }
            
            let albumData = await fetch(`./songs/${folder}/info.json`);
            let response = await albumData.json();
            //Get the metadata of the folder
            // let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)  // local machine
            let a = await fetch(`./songs/${folder}/info.json`)
            //let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                            <div class="play">
                           <img src="img/play.svg" alt="">
                            </div>
                            <img src="./songs/${folder}/cover.jpeg" alt="">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>
                        `
        }
    }
        // Load the first album automatically
        if (firstAlbumFolder) {
            songs = await getSongs(`songs/${firstAlbumFolder}`);
            playMusic(songs[0], true); // Load first song but keep it paused
        }


    //Load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })

}


async function main() {
    // Get the list of all the songs
    await getSongs("songs/");
    playMusic(songs[0], true)

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
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })

    //Add an event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Automatically play the next song when the current song ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
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
