console.log("lets write java script")
//global variable
let currentSong = new Audio();
let songs;
let currFolder

//cover seconds to seconds:minutes
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

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".flac")) {
            songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
        }
    }

    //Show all the songs in the playlists
    //too list the songs in your library
    let songul = document.querySelector(".songLists").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> <img  class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", "")}</div>
                                <div>RKM</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            // console.log(songName)
            playMusic(songName);
        });
    });
    return songs
}


//playMusic function

const playMusic = (track, pause = false) => {
    // Encode the track name to handle spaces and special characters
    // console.log(track)
    const encodedTrack = encodeURIComponent(track);
    // const audio = new Audio(`/PROJECT2%20-SPOTIFY%20CLONE/songs/${encodedTrack}`);
    //this will play thi current song u clicked
    currentSong.src = `/PROJECT2%20-SPOTIFY%20CLONE/${currFolder}/${encodedTrack}`;
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"


    currentSong.addEventListener('error', (event) => {
        console.error('Error loading audio:', event.error, `Track: ${encodedTrack}`);
    });

};

async function displayAlbum() {
    let a = await fetch(`/folder/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    cardContainer.innerHTML = ""; // Clear any existing content in the container

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/folder")) {
            let fold = e.href.split("/").slice(-2)[0];
            
            // Get the metadata of the folder
            let metadata = await fetch(`E/folder/${fold}/info.json`);
            let response = await metadata.json();

            // Create the card HTML
            cardContainer.innerHTML += `
                <div data-folder="${fold}" class="card">
                    <div class="play">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <img src="/folder/${fold}/cover.jpeg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        }
    }

    //Load the playlist whenevr is clicked
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (item) => {
            const folder = item.currentTarget.dataset.folder;

            if (folder) {
                await getSongs(`folder/${folder}`);
                playMusic(songs[0])
            } else {
                console.error("No folder found in dataset.");
            }
        });
    });
}




async function main() {

    //get the list of the songs
    await getSongs("folder/song01")

    //this will play music from start
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbum()

    //Attach an event listner to play , next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currenttime ,currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/
        ${secondsToMinutesSeconds(currentSong.duration)}`
        const positionPercentage = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = positionPercentage + "%";
    })
    //add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.target.getBoundingClientRect(),e.offsetX) //offsetX will show the seconds where u clicked and e.target.getBoundingClientRect()->this will show app kaha pa click kiya ho
        let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100

        document.querySelector(".circle").style.left = persent + "%";
        currentSong.currentTime = ((currentSong.duration) * persent) / 100
    })

    //add an event listener for hamburger to open
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = '0'
    })
    //add an event listener for hamburger to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = '-120%'
    })

    //add an previous Event listener
    prev.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()))// Decode URL-encoded filename
        if ((index - 1) >= 0) {//if condition for last song so that it will not work
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()))// Decode URL-encoded filename

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            console.log("No next song available.");
        }
    });
    //add an event to volume
    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e , e.target)
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume > img").src= document.querySelector(".volume > img").src.replace("mute.svg","volume.svg")
        }
    })

    //add event listener too mute the track
    document.querySelector(".volume > img").addEventListener("click",e=>{
        // console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src= e.target.src.replace("volume.svg","mute.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            currentSong.volume = 0;
            
        }
        else{
            e.target.src= e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50
        }
    })

}
main() 