const { remote, ipcRenderer } = require('electron');
const ipc = require('electron').ipcRenderer;

document.getElementById('minimize-button').addEventListener('click', () => {
  remote.getCurrentWindow().minimize();
});

document.getElementById('min-max-button').addEventListener('click', () => {
  const currentWindow = remote.getCurrentWindow()
  if(currentWindow.isMaximized()) {
    currentWindow.unmaximize();
  } else {
    currentWindow.maximize();
  }
})

document.getElementById('close-app-button').addEventListener('click', () => {
  remote.app.quit();
});

document.getElementById("login").addEventListener('click', () => {
	if (document.getElementById("key").value == "test") {
		ipc.send('login-successfull');
	}
});