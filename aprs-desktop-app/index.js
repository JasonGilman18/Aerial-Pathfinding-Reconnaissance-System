const electron = require('electron');
const wifi = require("node-wifi");
const fs = require('fs');
const path = require('path');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
let subpy;

app.on('ready', function(){

    //path to the python server
    //subpy = require('child_process').spawn('./backend/dist/aprsServer.exe', [{detached: true},{windowsHide: true}]);
    subpy = require('child_process').spawn('./backend/dist/aprsServer.exe', {detached: true});


    //window height and width upon first opening
    //path to the main html file (index.html)
    var openWindow = function() {
        mainWindow = new BrowserWindow({width: 800, minWidth: 800, height: 600, minHeight: 600, frame: false, webPreferences: {nodeIntegration: true}});
        mainWindow.loadURL('file://' + __dirname + '/build/index.html');
        mainWindow.on('closed', function(){
            mainWindow = null;
        });
    }

    wifi.init({iface: null});
    
    /*
    var startUp = function(){
        require('request-promise')(apiUrl).then(function(){
            openWindow();
        }).catch(function(err){
            startUp();
        });
    }
    */

    openWindow();

    mainWindow.webContents.openDevTools()
});

app.on('window-all-closed', function(){
    
    app.quit();
});

app.on('quit', function(){

    //fetch(apiUrl + '/shutdown', {method: 'POST'});
    /*
    ps_tree(subpy.pid, function(err, children){

        children.map((p) => {

            console.log(p.PID);
            process.kill(p.PID);
        });
    });
    */

    /*
    console.log("here")
    find("name", "aprsServer.exe").then(function (list) {

        
        console.log(list.length);
        //list.map((pid) => kill(pid));
    }, function(err){
        
        console.log(err);
    });
    */
        
    //subpy.kill('SIGINT');
    //process.kill(subpy.pid);
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


ipcMain.on('connect-aerial', (event, arg1, arg2) => {

    const ssid = aerialSSID = arg1;
    const pass = aerialPass = arg2;
    wifi.connect({ssid: ssid, password: pass}, error => {

        if(error)
        {
            event.sender.send('connect-aerial', false);
        }
        else
        {
            event.sender.send('connect-aerial', true);
        }
    });
});

ipcMain.on('connect-land', (event, arg1, arg2) => {

    const ssid = landSSID = arg1;
    const pass = landPass = arg2;
    wifi.connect({ssid: ssid, password: pass}, error => {

        if(error)
        {
            event.sender.send('connect-land', false);
        }
        else
        {
            event.sender.send('connect-land', true);
        }
    });
});




ipcMain.on('save-video-data', (event, arg1) => {

    const encodedVideo = arg1;
    
    fs.writeFile('./static/encodedVideos/videoFromServer.txt', encodedVideo, (err) => {

        if(err)
        {
            event.sender.send('save-video-data', false);
        }
        else
        {
            event.sender.send('save-video-data', true);
        }
    });
});