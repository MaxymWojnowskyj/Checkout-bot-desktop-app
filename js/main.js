const { remote, ipcRenderer } = require('electron');

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

let menu_spans = document.querySelectorAll('nav li');
let contentContainers = document.querySelectorAll('.content');

for (var i = 0; i < menu_spans.length; i++) {
    menu_spans[i].addEventListener('click', tab_switcher, false);
}

function tab_switcher() {
	let targetID = this.getAttribute('data-target');
	for (var i = 0; i < menu_spans.length; i++) {
    	menu_spans[i].classList.remove('active');
    	if (menu_spans[i].getElementsByTagName('img')[0].src.includes('-active')) {
    		menu_spans[i].getElementsByTagName('img')[0].src= menu_spans[i].getElementsByTagName('img')[0].src.split('-')[0]+'.png';
    	}
    	menu_spans[i].getElementsByTagName('img')[0].src.split('.')[0] = menu_spans[i].getElementsByTagName('img')[0].src.split('-')[0]+'.png';
	}
	this.classList.add('active');
	this.getElementsByTagName('img')[0].src = this.getElementsByTagName('img')[0].src.split('.')[0]+'-active.png';
	
	for (var i = 0; i < contentContainers.length; i++) {
    	contentContainers[i].classList.remove('active');
    	contentContainers[i].classList.add('remove');
	}
	document.getElementById(targetID).classList.add('active');
	document.getElementById(targetID).classList.remove('remove');
}