const { ipcRenderer } = require('electron')
const { $ } = require('./helper')
const path = require('path')
/*
    这种写法是错误的
    const { path } = require('path')
*/

let musicFilesPath = []

// 点击选择音乐
$('select-music').addEventListener('click', () => {
    ipcRenderer.send('open-music-file')
})

// 点击导入音乐
$('add-music').addEventListener('click', () => {
    ipcRenderer.send('add-tracks', musicFilesPath)
})
// 渲染列表到页面
const renderListHTML = (pathes) => {
    const musicList = $('music-list')
    const musicItemsHTML = pathes.reduce((html, music) => {
        html += `<li class="list-group-item">${path.basename(music)}</li>`
        return html
    }, ' ')
    musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`
}

// 接收音乐列表,渲染到网页
ipcRenderer.on('selected-files', (event, pathes) => {
    if (Array.isArray(pathes)) {
        renderListHTML(pathes)
        musicFilesPath = pathes
        // $('music-list').innerHTML = path.toString();
    }

})