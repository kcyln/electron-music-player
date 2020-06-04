const { app, BrowserWindow, ipcMain,dialog } = require('electron')
const DataStore = require('./renderer/MusicDataStore')

const myStore = new DataStore({'name': 'Music Data'})

class AppWindow extends BrowserWindow {
    constructor(config,fileLocation) {
        const basicConfig = {
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            }
        }
        // const finalConfig = Object.assign(basicConfig, config)
        const finalConfig = {...basicConfig, ...config} //ES6
        super(finalConfig)
        this.loadFile(fileLocation)
        this.once('ready-to-show', () => {
            this.show()
        })
    }
}

app.on('ready', () => {
    const mainWindow = new AppWindow({},'./renderer/index.html')
    // mainWindow.loadURL("https://www.baidu.com")
    // const secondWindow = new BrowserWindow({
    //     width: 400,
    //     height: 300,
    //     webPreferences: {
    //         nodeIntegration: true
    //     },
    //     parent: mainWindow  // 设置父窗口为mainWindow,当父窗口关闭时子窗口也一起关闭 
    // })
    // secondWindow.loadFile('second.html')
    // ipcMain.on('message', (event, arg) => {
    //     console.log(arg);
    //     // event.sender.send('reply', 'hello from main')
    //     mainWindow.send('reply', 'hello from main');
    // })

    // 开始打开页面时先获取一次歌曲列表
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.send('getTracks', myStore.getTracks())
    })

    // 打开添加歌曲到曲库窗口
    ipcMain.on('add-music-window', (event, arg) => {
        // console.log(arg)
        const addWindow = new AppWindow({
            width: 500,
            height: 400,
            parent:mainWindow
        }, './renderer/add.html')
    })
    // 弹出选择音乐对话框，选择需要播放的音乐
    ipcMain.on('open-music-file', (event) => {
        dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [{name:'Music', extensions: ['mp3']}]
        }).then(result => {
            if (result.filePaths.length > 0){
                // 发送选择的音乐列表 list
                event.sender.send('selected-files', result.filePaths)
            }
        })
    })
    // 导入音乐，音乐列表持久化存储。
    ipcMain.on('add-tracks', (event, path) => {
        // console.log(app.getPath('userData'))
        const updatedTracks = myStore.addTracks(path).getTracks()
        mainWindow.send('getTracks', updatedTracks)
    })

    ipcMain.on('delete-track', (event, id) => {
        const updatedTracks = myStore.deleteTrack(id).getTracks()
        mainWindow.send('getTracks', updatedTracks)
    })
})