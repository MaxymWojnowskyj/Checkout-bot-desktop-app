const electron = require('electron');
const path = require('path');
const url = require('url');
//const client = require('discord-rich-presence')('640717325858897930');
// SET ENV
process.env.NODE_ENV = 'development';

//production

//^^^ if in development mode then you can use dev tools

const { app, BrowserWindow, ipcMain } = electron;

//const Menu = electron.Menu;

let mainWindow;


app.on('ready', function () {

  /*
  const template = [{label:''}];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  */
  /*
  client.updatePresence({
    state: 'Version 1.0.0',
    details: 'Looking for Bugs...',
    startTimestamp: Date.now(),
    largeImageKey: 'hydro',
    instance: true,
  });
  */
  
  ipcMain.on('run-task', (event, Task) => {
    event.sender.send('run-task-bg', Task);
  });
  
  mainWindow = new BrowserWindow({ 
    width: 1100, height: 650, 
    webPreferences:{nodeIntegration: true},
    frame: false
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'login.html'), // will be login.html
    protocol: 'file:',
    slashes: true
  }));

  ipcMain.on('login-successfull', () => {
    mainWindow.loadURL('file://' + __dirname + '/main.html');
  });

  ipcMain.on('logout', () => {
    mainWindow.loadURL('file://' + __dirname + '/login.html');
  });

   ipcMain.on('open-captcha', (event, website) => {
    //window.open('http://captcha.' + website.url + ':' + website.port);
    let captchaWindow = new BrowserWindow({ width: 350, height: 500, webPreferences:{nodeIntegration: true} });
    
    captchaWindow.loadURL('http://captcha.' + website.url + ':' + website.port);
      /*
      url.format({
      pathname: path.join(__dirname, 'captcha.html'),
      protocol: 'file:',
      slashes: true
    }));
    */
    });

  ipcMain.on('captcha-token', (event, Token) => {
    event.sender.send('captcha-tokenB', Token);
  });


  ipcMain.on('run-task', (event, Task) => {
    event.sender.send(Task.Type, Task);
  });
  ipcMain.on('stop-task', (event, Task) => {
    event.sender.send(Task.Type+" Stop", Task);
  });
  ipcMain.on('no-proxyB', (event, Task) => {
    event.sender.send('no-proxy', Task);
  });

  ipcMain.on('task-stoppedB', (event, Task) => {
    event.sender.send('task-stopped', Task);
  });

  ipcMain.on('task-stoppedB', (event, Task) => {
    event.sender.send("task-stopped", Task);
  });

  ipcMain.on('item-foundB', (event, itemName, Task) => {
    event.sender.send('item-found', itemName, Task);
  });

  ipcMain.on('color-foundB', (event, itemColor, Task) => {
    event.sender.send('color-found', itemColor, Task);
  });

  ipcMain.on('color-insteadB', (event, itemColor, Task) => {
    event.sender.send('color-instead', itemColor, Task);
  });

  ipcMain.on('color-notFoundB', (event, itemColor, Task) => {
    event.sender.send('color-notFound', itemColor, Task);
  });

  ipcMain.on('size-foundB', (event, itemSize, Task) => {
    event.sender.send('color-found', itemSize, Task);
  });

  ipcMain.on('size-insteadB', (event, itemSize, Task) => {
    event.sender.send('size-instead', itemSize, Task);
  });

  ipcMain.on('size-notFoundB', (event, itemSize, Task) => {
    event.sender.send('size-notFound', itemSize, Task);
  });

  ipcMain.on('waitingCaptchaB', (event, Task) => {
    event.sender.send('waitingCaptcha', Task);
  });

  ipcMain.on('atcB', (event, Task) => {
    event.sender.send('atc', Task);
  });

  ipcMain.on('delayingB', (event, Task) => {
    event.sender.send('delaying', Task);
  });

  ipcMain.on('submiting-infoB', (event, Task) => {
    event.sender.send('submiting-info', Task);
  });

  ipcMain.on('invalid-infoB', (event, Task) => {
    event.sender.send('invalid-info', Task);
  });

  ipcMain.on('check-emailB', (event, Task) => {
    event.sender.send('check-email', Task);
  });

  ipcMain.on('checkout-failedB', (event, Task) => {
    event.sender.send('checkout-failed', Task);
  });

  ipcMain.on('retryingB', (event, Task) => {
    event.sender.send('retrying', Task);
  });

  ipcMain.on('load-TasksB', (event) => {
    event.sender.send('loadTasks');
  });




  // Quit app when closed
  mainWindow.on('closed', function () {
    app.quit();
  });

});
