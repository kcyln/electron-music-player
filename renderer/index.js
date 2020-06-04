const { ipcRenderer } = require('electron')
const { $, convertDuration } = require('./helper')

let musicAudio = new Audio()
let allTracks
let currentTrack

// 点击添加歌曲到曲库按钮
$('add-music-button').addEventListener('click', () => {
    ipcRenderer.send('add-music-window')
})

// 渲染列表到页面
const renderListHTML = (tracks) => {
    const tracksList = $('tracksList')
    const tracksItemsHTML = tracks.reduce((html, track) => {
        html += `<li class="row list-group-item music-track d-flex align-items-center justify-content-between">
            <div class="col-10">
                <i class="fas fa-music text-secondary mr-2"></i>
                <b>${track.fileName}</b>
            </div>
            <div class="col-2">
                <i class="fas fa-play mr-3" data-id="${track.id}"></i>
                <i class="fas fa-trash-alt" data-id="${track.id}"></i>
            </div>
        </li>`
        return html
    }, '')
    const emptyTrackHTML = `<p>还没有添加任何音乐</p>`
    tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksItemsHTML}</ul>` : emptyTrackHTML
}

const renderPlayerHTML = (name, duration) => {
    const player = $('player-status')
    const html = `
        <div class="col font-weight-bold">
            正在播放: ${name}
        </div>
        <div class="col">
            <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
        </div>`
    player.innerHTML = html
    const a = `${convertDuration(duration)}`
    console.log(a)
}

const updateProgessHTML = (currentTime, duration) => {
    // 计算进度条
    const progess = Math.floor(currentTime / duration * 100)
    const bar = $('player-progess')
    const seeker = $('current-seeker')
    seeker.innerHTML = convertDuration(currentTime)
    bar.style.width = progess + "%"
}

// 接收发送过来的音乐列表
ipcRenderer.on('getTracks', (event, tracks) => {
    allTracks = tracks
    renderListHTML(tracks)
})

$('tracksList').addEventListener('click', (event) => {
    event.preventDefault()
    const { dataset,classList } = event.target
    const id = dataset && dataset.id
    if (id && classList.contains('fa-play')){
        // 开始播放音乐
        if (currentTrack && currentTrack.id === id){
            // 继续播放音乐
            musicAudio.play()
        }else {
            // 播放新的歌曲，注意还原之前的图标
            currentTrack = allTracks.find(track => track.id === id)
            musicAudio.src = currentTrack.path
            musicAudio.play()
            const resetIconEle = document.querySelector('.fa-pause')
            if (resetIconEle){
                resetIconEle.classList.replace('fa-pause', 'fa-play')
            }
        }
        currentTrack = allTracks.find(track => track.id === id)
        musicAudio.src = currentTrack.path
        musicAudio.play()
        classList.replace('fa-play', 'fa-pause')
    }else if (id && classList.contains('fa-pause')){
        // 点击暂停播放
        musicAudio.pause()
        classList.replace('fa-pause', 'fa-play')
    }else if (id && classList.contains('fa-trash-alt')){
        // 发送事件，删除这条音乐
        ipcRenderer.send('delete-track', id)
    }
})

musicAudio.addEventListener('loadedmetadata', () => {
    // 渲染播放器状态
    renderPlayerHTML(currentTrack.fileName, musicAudio.duration)
})

musicAudio.addEventListener("timeupdate", () => {
    // 更新播放器状态
    updateProgessHTML(musicAudio.currentTime, musicAudio.duration)
})