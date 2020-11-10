const electron = require('electron');
const child_process = require('child_process');
const find = require("find-process");
const ps_tree = require("ps-tree");
const wifi = require("node-wifi");
const fs = require('fs');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
let subpy;
let apiUrl = "http://127.0.0.1:5000";
let aerialSSID;
let aerialPass;
//const childPids = [];


app.on('ready', function(){

    //path to the python server
    //subpy = require('child_process').spawn('./backend/dist/aprsServer.exe', [{detached: true},{windowsHide: true}]);
    subpy = require('child_process').spawn('./backend/dist/aprsServer.exe', {detached: true});
    //subpy = child_process.spawn('./backend/dist/aprsServer.exe');
    //subpy = child_process.execFile('./backend/dist/aprsServer.exe');
    //subpy = child_process.exec('"backend/dist/aprsServer.exe"');
    //childPids.push(subpy.pid);

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


ipcMain.on('print-inststructions', (event, arg1) => {

    const list_of_instructions = arg1;

    fs.appendFile('coordinates.txt', list_of_instructions, (err) => {
        
        if(err)
            console.log(err);
    });
});