const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const Store = require('electron-store');
const path = require('path');
const url = require('url');

let safeExit = false;

const store = new Store({
    defaults: {
        // 800x600 is the default size of our window
        windowSize: { width: 800, height: 600 },
        windowPos: {x: 200, y: 200}, 
        filePath: null
    }
});


function sendReq(msg, data=null) {
    win.webContents.send('mainprocess-request', {msg: msg, data: data});
}


// Window menu template
const menuTemplate = [
    {
        label: 'File',
        submenu : [
            {
                label: 'New', accelerator: 'CmdOrCtrl+N',
                click () {  sendReq('NewFile'); }
            },{
                label: 'Open', accelerator: 'CmdOrCtrl+O',
                click () {  sendReq('OpenFile');    }
            },{
                label: 'Save', accelerator: 'CmdOrCtrl+S',
                click () {  sendReq('SaveFile');    }
            },{
                label: 'Save As', accelerator: 'CmdOrCtrl+Shift+S',
                click () {  sendReq('SaveAsFile');  }
            },{type: 'separator'},{
                label: 'Export',
                accelerator: 'CmdOrCtrl+E',
                click () {  sendReq('ExportImage'); }
            }
        ]
    },{
        label: 'Edit',
        submenu:[
            {role: 'undo'},
            {role: 'redo'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'selectall'},
            {role: 'delete'}
        ]
    },{
        label: 'View',
        submenu: [
            // {role: 'reload'},
            // {role: 'forcereload'},
            // {role: 'toggledevtools'},
            // {type: 'separator'},
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {type: 'separator'},
            {role: 'togglefullscreen'}
        ]
    },{
        role: 'help',
        submenu:[
            {
                label: 'Learn More',
                accelerator: 'CmdOrCtrl+H',
                click () {
                    createInfoWindow();
                }
            }
        ]
    }
];


// Init win
let win;
let infoWin;


function createWindow() {
    // Create browser window

    let { x, y } = store.get('windowPos');
    let { width, height } = store.get('windowSize');

    win = new BrowserWindow({width: width, height: height, x: x, y: y, icon: path.join(__dirname, '/res/icons/icon.png')});

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));

    // Open devtool
    // win.webContents.openDevTools();

    const menu = Menu.buildFromTemplate(menuTemplate);

    Menu.setApplicationMenu(menu);

    win.on('resize', () => {
        let { width, height } = win.getSize();
        store.set('windowSize', { width, height });
    });

    win.on('move', () => {
        let {x, y} = win.getPosition();
        store.set('windowPos', { x, y });
    })
    
    win.on('close', (e) => {
        if(!safeExit) {
            e.preventDefault();
            sendReq('Exitting');
        }
    });
}

function createInfoWindow() {
    infoWin = new BrowserWindow({
        width: 400, height: 450,
        resizable: false,
        parent: win,
        icon: path.join(__dirname, '/res/icons/icon.png')
    });
    infoWin.loadURL(url.format({
        pathname: path.join(__dirname, '/src/info.html'),
        protocol: 'file',
        slashes: true
    }));

    // infoWin.webContents.openDevTools();

    infoWin.on('close', (e) => {
        infoWin = null;
    });
}


// Run create window
app.on('ready', createWindow)


// Quit when all windows are closed
app.on('window-all-closed', () => {
    if(process.platform != 'darwin'){
        app.quit();
    }
});


ipcMain.on('renderer-response', (event, arg) => {
    switch(arg.msg) {
      case 'Exit':
        // https://github.com/sindresorhus/electron-store
        safeExit=true;
        app.quit();
        break;
    }
});


ipcMain.on('renderer-request', (event, arg) => {
    switch(arg.msg) {
        case 'TitleChanged':
            store.set('filePath', arg.data);
            // console.log(arg.data);
            break;
        case 'ToInit':
            sendReq("Init", store.get('filePath'));
            break;
        default:
            break;
    }
});
