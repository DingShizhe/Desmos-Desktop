const {app, BrowserWindow, Menu, dialog} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

// Init win
let win;

function createWindow() {
    // Create browser window
    win = new BrowserWindow({width:800, height:600, icon: path.join(__dirname, '/build/icon.png')});

    
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));
    
    // Open devtool
    // win.webContents.openDevTools();

    const menuTemplate = [
        {
            label: 'File',
            submenu : [
                {label: 'Open', accelerator: 'CmdOrCtrl+O',
                click () {
                    win.webContents.executeJavaScript(
                        fs.readFileSync(path.join(__dirname, 'assert/js/open.js')).toString()
                    );
                }
                },
                {label: 'Save', accelerator: 'CmdOrCtrl+S',
                click () {
                    win.webContents.executeJavaScript(
                        fs.readFileSync(path.join(__dirname, 'assert/js/save.js')).toString()
                    );
                }
                },
                {type: 'separator'},
                {label: 'Export',
                accelerator: 'CmdOrCtrl+E',
                click () {
                    win.webContents.executeJavaScript(
                        fs.readFileSync(path.join(__dirname, 'assert/js/export.js')).toString()
                    );
                }
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
        },
        {
            label: 'View',
            submenu: [
                // {role: 'reload'},
                // {role: 'forcereload'},
                {role: 'toggledevtools'},
                // {type: 'separator'},
                {role: 'resetzoom'},
                {role: 'zoomin'},
                {role: 'zoomout'},
                {type: 'separator'},
                {role: 'togglefullscreen'}
            ]
        },
        {
            role: 'help',
            submenu:[
                {
                    label: 'Learn More',
                    accelerator: 'CmdOrCtrl+H',
                    click () {
                        dialog.showMessageBox({
                            title: 'Info',
                            type: 'info',
                            message: 'Powered By Desmos & Electron.\nBuild by DingShizhe.'
                        })
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    win.on('cloesed', () => {
        win = null;
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
