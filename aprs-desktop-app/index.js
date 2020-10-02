const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
let subpy;
let apiUrl = "http://127.0.0.1:5000";


app.on('ready', function(){

    //path to the python server
    subpy = require('child_process').spawn('./backend/dist/server');

    //window height and width upon first opening
    //path to the main html file (index.html)
    var openWindow = function() {
        mainWindow = new BrowserWindow({width: 800, minWidth: 800, height: 600, minHeight: 600, frame: false, webPreferences: {nodeIntegration: true}});
        mainWindow.loadURL('file://' + __dirname + '/build/index.html');
        mainWindow.on('closed', function(){
            mainWindow = null;
        });
    }
    
    var startUp = function(){
        require('request-promise')(apiUrl).then(function(){
            openWindow();
        }).catch(function(err){
            startUp();
        });
    }

    openWindow();

    mainWindow.webContents.openDevTools()
});

app.on('window-all-closed', function(){
    app.quit();
});

app.on('quit', function(){
    subpy.kill('SIGINT');
});


ipcMain.on('size-change', (event, arg) => {

    if(mainWindow.isMaximized())
        event.sender.send("toolbar", true);
    else
        event.sender.send("toolbar", false);
});

ipcMain.on('toolbar', (event, arg) => {
    
    if(arg == "min-button" || arg == "min-icon")
    {
        mainWindow.minimize();
    }
    else if(arg == "max-button" || arg == "max-icon")
    {
        mainWindow.maximize();
        event.sender.send("toolbar", true);
    }
    else if(arg == "close-button" || arg == "close-icon")
    {
        mainWindow.close();
    }
    else if(arg == "restore-button" || arg == "restore-icon")
    {
        mainWindow.unmaximize();
        event.sender.send("toolbar", false);
    }
});