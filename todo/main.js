const electron =  require('electron');
const url =  require('url');
const path = require('path');
//use ia32 for 32bit
const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen app to be ready
app.on('ready', function() {
    //this create window
    mainWindow = new BrowserWindow({});
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Quitting whole app
    mainWindow.on('closed', function() {
        app.quit();
    });
    //building menu here form template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Inserting menu
    Menu.setApplicationMenu(mainMenu);
});

//Handle createAddWindow
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: "Add Task"
    });
    //Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Clearing garbage space taken by addWindow()
    addWindow.on('close', function(){
        addWindow = null;
    })
}

//catching the form data from addWindow.html
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click() {
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

//if Mac, Then confguring Menu
if(process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

//Adding Developer Option, if not in Production
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',                
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                },
            },
            {
                role: 'reload'
            }
        ]
    })
}