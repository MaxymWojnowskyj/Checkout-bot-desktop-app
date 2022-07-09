const fs = require('fs');
const {dialog} = require('electron').remote;
const website = ({'value': 'https://www.supremenewyork.com'});

window.onload = loadProxies();

function loadProxies() {
	//ipc.send('load-TasksB');
	let proxiesArray = JSON.parse(localStorage.getItem("ProxyCollection"));
	if (proxiesArray) {
		document.getElementById("proxy-table").tBodies[0].innerHTML = "";
		proxiesArray.forEach(function(Proxy) {
			addProxyToTable(Proxy);
		});
	}
}

function changeTable(Proxy, status, colour) {
	let all_rows = document.getElementById("proxy-table").tBodies[0].rows;
	let proxy_row;
	for (var i = 0; i < all_rows.length; i++) {
		if (all_rows[i].cells[0].innerHTML == Proxy.Ip) {
			proxy_row = all_rows[i];
		}
	}	
	proxy_row.cells[4].style.color = colour;
	proxy_row.cells[4].innerHTML = status;
}

function addProxyToTable(Proxy) {
	let tableBody = document.getElementById("proxy-table").tBodies[0];
	let rows_count = tableBody.rows.length;
	let tableRow = document.createElement('tr');
	let Ip = document.createElement('td');
	let port = document.createElement('td');
	let username = document.createElement('td');
	let password = document.createElement('td');
	let status = document.createElement('td');
	Ip.innerHTML = Proxy.Ip;
	port.innerHTML = Proxy.Port;
	username.innerHTML = Proxy.Username;
	password.innerHTML = Proxy.Password;
	status.innerHTML = "idle";

	let runBtn = document.createElement('button');
	let removeBtn = document.createElement('button');
	runBtn.classList.add('runBtn');
	removeBtn.classList.add('removeBtn');
	runBtn.id = rows_count;
	removeBtn.id = rows_count;
	runBtn.innerHTML = '<img class="actions-img" src="./images/play-img.png" />';
	removeBtn.innerHTML = '<img class="actions-img" src="./images/delete-img.png" />';

	runBtn.addEventListener("click", (e)=> {
		runProxy(e);
	});

	removeBtn.addEventListener("click", (e)=> {
		removeProxy(e);
	});

	let actionsTd = document.createElement("td");
	actionsTd.appendChild(runBtn);
	actionsTd.appendChild(removeBtn);
	tableRow.appendChild(Ip);
	tableRow.appendChild(port);
	tableRow.appendChild(username);
	tableRow.appendChild(password);
	tableRow.appendChild(status);
	tableRow.appendChild(actionsTd);
	tableBody.appendChild(tableRow);
}

function runProxy(e) {
	let clickedID = Number(e.target.parentElement.id);
	let proxyArray = JSON.parse(localStorage.getItem("ProxyCollection"));
	let proxy = proxyArray[clickedID];
	//let website = document.getElementById("website");
	if (!website.value) {
		alert('please select website');
		return false;
	}
	changeTable(proxy,'Connecting..', 'orange');
	testProxy(proxy);
}

function removeProxy(e) {
	let clickedID = Number(e.target.parentElement.id);
	let proxyArray = JSON.parse(localStorage.getItem("ProxyCollection"));
	let removedProxy = proxyArray.splice(clickedID, 1);
	console.log(removedProxy);
	localStorage.removeItem("ProxyCollection");
	localStorage.setItem("ProxyCollection", JSON.stringify(proxyArray));
	loadProxies();
}

function testProxy(Proxy) {

	console.log(Proxy);
	//let website = document.getElementById("website");
	console.log(website.value);
	let proxyUrl;
    
    if (Proxy.Username && Proxy.Password) {
        proxyUrl = "http://" + Proxy.Username + ":" + Proxy.Password + "@" + Proxy.Ip + ":" + Proxy.Port;
    } else {
    	proxyUrl = "http://"+ Proxy.Ip + ":" + Proxy.Port;
    }
	console.log(proxyUrl);

	const request = require('request');

	var proxiedRequest = request.defaults({proxy: proxyUrl, timeout: 10000});

    proxiedRequest.get(website.value, (error, response) => {

        var startTime = new Date();

     	if(error || !response) {
     		changeTable(Proxy, 'Failed', '#ff4646');
     		console.error(error.stack);

     	} else if (response.statusCode == "200") {
     		console.log(response);

      		var endTime = new Date();
      		console.log(startTime);
      		console.log(endTime);
      		var timeDiff = Number(endTime) - Number(startTime);
      		changeTable(Proxy, timeDiff+' ms', '#00ff99');

     	} else if (response.statusCode == "403") {
     		changeTable(Proxy, 'Banned', '#ff4646');
     	}
    });

}


let saveProxies = document.getElementById("saveProxies");
saveProxies.addEventListener('click', () => {
	let proxy_input = document.getElementById("proxies_input");
	let proxiesArray = proxies_input.value.split("\n");

	let savedProxies;
	savedProxies = JSON.parse(localStorage.getItem("ProxyCollection"));

	if (savedProxies == null) {
		localStorage.setItem("ProxyCollection", JSON.stringify([]));
		savedProxies = JSON.parse(localStorage.getItem("ProxyCollection"));
	}
	let proxyArray = [];

	for (var i = 0; i < proxiesArray.length; i++) {
		proxyArray.push({
			"Ip": proxiesArray[i].split(":")[0],
			"Port": proxiesArray[i].split(":")[1],
			"Username": proxiesArray[i].split(":")[2],
			"Password": proxiesArray[i].split(":")[3]
		});
		savedProxies.push(proxyArray[i]);
	}
	localStorage.removeItem("ProxyCollection");
	localStorage.setItem("ProxyCollection", JSON.stringify(savedProxies));
	proxies_input.value = "";
	loadProxies();

});

let runProxies = document.getElementById("runAllProxies");
runProxies.addEventListener('click', () => {
	let proxyArray = JSON.parse(localStorage.getItem("ProxyCollection"));
	proxyArray.forEach(function(Proxy) {
		testProxy(Proxy);
	});
});

let failedProxies = document.getElementById("removeFailedProxies");
failedProxies.addEventListener('click', () => {
	let proxyTableArray = document.getElementById("proxy-table").rows;
	for (var i = proxyTableArray.length -1; i >= 0; i--) { //goes backwards because when it goes forward it splices object 2 then tries to splice object 3 but object 3 converts to object 2 becuase the old object 2 was spliced
		if (["Failed", "Banned"].includes(proxyTableArray[i].cells[4].innerHTML)) { 
			let proxyArray = JSON.parse(localStorage.getItem("ProxyCollection"));
			let removedProxy = proxyArray.splice(i-1, 1);
			localStorage.removeItem("ProxyCollection");
			localStorage.setItem("ProxyCollection", JSON.stringify(proxyArray));
		}
	}
	loadProxies();
});

/*
173.192.21.89:8123
157.245.169.49:3128
123.345.678.91:8080
*/


let deleteProxies = document.getElementById("deleteAllProxies");
deleteProxies.addEventListener('click', () => {
	localStorage.removeItem("ProxyCollection");
	localStorage.setItem("ProxyCollection", '[]'); //JSON.stringify([]) if '[]' doesnt work
	loadProxies();
});

let importProxies = document.getElementById("importProxies");
importProxies.addEventListener('click', () => {

	const newDialog = dialog.showOpenDialog({
	  	filters: [
	    	{ name: 'TEXT', extensions: ['txt'] },
	  	]
	});
	newDialog.then(result => {
		fs.readFile(result.filePaths[0], "utf-8", (err, data) => {
			if (err) {
				alert("cannot read file", err);
				return;
			}
			let proxyInput = document.getElementById("proxies_input");
			proxyInput.value = data;
			/*
			let fileData = data.split("\n");
			fileData.forEach((proxy) => {
				proxyInput.value += proxy+"\n";
			});
			*/
		});
	});
});


