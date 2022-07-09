const electron = require('electron');
const ipc = electron.ipcRenderer;

const open = require("open");
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const hostile = require('hostile')


ipc.on('task-stopped', function (event, Task) {
	changeLog(Task, 'Stopped', "#ff4646");
	setTimeout(() => { // waits for 1 second to go back to idle after log changes to stopped
		changeLog(Task, "Idle", "white");
	}, 1000);
});
ipc.on('item-found', function (event, itemName, Task) {
	changeLog(Task, itemName + ' Found', "#ffe600");
});

ipc.on('color-found', function (event, itemColor, Task) {
	changeLog(Task, itemColor + ' Selected', "#ffe600");
});

ipc.on('color-instead', function (event, itemColor, Task) {
	changeLog(Task, itemColor + ' Instead', "#ffe600");
});

ipc.on('color-notFound', function (event, itemColor, Task) {
	changeLog(Task, itemColor + ' Not Found', "#ff4646");
});

ipc.on('size-found', function (event, itemSize, Task) {
	changeLog(Task, itemSize + ' Selected', "#ffe600");
});

ipc.on('size-instead', function (event, itemSize, Task) {
	changeLog(Task, itemSize + ' Instead', "#ffe600");
});

ipc.on('size-notFound', function (event, itemSize, Task) {
	changeLog(Task, itemSize + ' Not Found', "#ff4646");
});

ipc.on('waitingCaptcha', function (event, Task) {
	changeLog(Task, 'Waiting For Captcha', "#ff4646");
});

ipc.on('atc', function (event, Task) {
	changeLog(Task, 'Added To Cart', "#ffe600");
});

ipc.on('delaying', function (event, Task) {
	changeLog(Task, 'Delaying', "#ffe600");
});

ipc.on('submiting-info', function (event, Task) {
	changeLog(Task, 'Submiting Info', "#ffe600");
});
ipc.on('invalid-info', function (event, Task) {
	changeLog(Task, 'Invalid Checkout Info', "#ff4646");
	let all_rows = document.getElementById("task-table").rows;
	let task_row = all_rows[Number(Task.Id)];
	let run_stop = task_row.cells[8].children[0];
	run_stop.children[0].src = "./images/play-img.png";
	run_stop.classList = "runBtn";
	setTimeout(() => {
		changeLog(Task, "Idle", "white");
	}, 2000);
});

ipc.on('error-submiting-info', function (event, Task) {
	changeLog(Task, 'Error Submiting Info', "#ff4646");
});

ipc.on('check-email', function (event, Task) {
	changeLog(Task, 'Check Email', "#00ff99");
	let all_rows = document.getElementById("task-table").rows;
	let task_row = all_rows[Number(Task.Id)];
	let run_stop = task_row.cells[8].children[0];
	run_stop.children[0].src = "./images/play-img.png";
	run_stop.classList = "runBtn";
	setTimeout(() => {
		changeLog(Task, "Idle", "white");
	}, 2000);
});

ipc.on('checkout-failed', function (event, Task) {
	changeLog(Task, 'Checkout Failed', "#ff4646");
	let all_rows = document.getElementById("task-table").rows;
	let task_row = all_rows[Number(Task.Id)];
	let run_stop = task_row.cells[8].children[0];
	run_stop.children[0].src = "./images/play-img.png";
	run_stop.classList = "runBtn";
	setTimeout(() => {
		changeLog(Task, "Idle", "white");
	}, 2000);

});

ipc.on('retrying', function (event, Task) {
	changeLog(Task, 'Retrying', "#ffe600");
});

ipc.on('processing', function (event, Task) {
	changeLog(Task, 'Processing...', "#ffe600");
});

ipc.on('no-proxy', function (event, Task) {
	changeLog(Task, 'No Proxy', "#ff4646");
});


ipc.on('loadTasks', function (event, Task) {
	loadTasks();
});
window.onload = reset();
window.onload = loadTasks();

function reset() { // resets every task to not running when page is refreshed/backend is stopped
	let tasksArray = JSON.parse(localStorage.getItem("TaskCollection"));
	if (tasksArray) {
		tasksArray.forEach(function (Task) {
			Task.Running = false;
		});
		//console.log(tasksArray);
		localStorage.removeItem("TaskCollection");
		localStorage.setItem("TaskCollection", JSON.stringify(tasksArray));
	}
}
const supremeCommunity = require('supreme-community-api')
console.log(supremeCommunity)
supremeCommunity.getLatestWeek().then(href => console.log(href))


function loadTasks() {

	//supremeCommunity.grabNewItems(href)
	//.then(list => console.log(list))
	let tasksArray = JSON.parse(localStorage.getItem("TaskCollection"));
	if (tasksArray) {
		let newTasks = addProxiesToTasks();
		loadSavedTasks(newTasks);
		function loadSavedTasks(newTasks) {
			document.getElementById("task-table").tBodies[0].innerHTML = "";
			newTasks.forEach(function (Task) {
				addTaskToTable(Task);
			});
		}
	}
}

function changeLog(Task, status, colour) {
	let all_rows = document.getElementById("task-table").rows;
	let task_row = all_rows[Number(Task.Id)];
	task_row.cells[7].style.color = colour;
	task_row.cells[7].innerHTML = status;
}

function runTask(e, ipc) {
	let clickedID = Number(e.target.parentElement.id) - 1;
	let tasksArray = JSON.parse(localStorage.getItem("TaskCollection"));
	let Task = tasksArray[clickedID];
	let btnDiv = e.target.parentElement;

	if (btnDiv.classList == "runBtn") {
		Task.Running = true;
		changeLog(Task, 'Searching', "white");
		e.target.src = "./images/stop-img.png";
		btnDiv.classList = "stopBtn";
		ipc.send('run-task', Task);
	} else {
		Task.Running = false;
		changeLog(Task, 'Stopping', "orange");
		e.target.src = "./images/play-img.png";
		btnDiv.classList = "runBtn";
		ipc.send('stop-task', Task);
	}
	localStorage.removeItem("TaskCollection");
	localStorage.setItem("TaskCollection", JSON.stringify(tasksArray));
}

function editTask(e, ipc) {

	let saved_profiles = JSON.parse(localStorage.getItem("billingProfiles"));
	if (saved_profiles) {
		let select_profile = document.getElementById("profile");
		select_profile.options.length = 1;
		saved_profiles.forEach(function (profile) {
			let selectOpt = document.createElement('option');
			selectOpt.appendChild(document.createTextNode(profile.Name));
			selectOpt.value = profile.Name;
			select_profile.append(selectOpt);
		});
	}
	let clickedID = Number(e.target.parentElement.id) - 1;
	let tasksArray = JSON.parse(localStorage.getItem("TaskCollection"));
	let Task = tasksArray[clickedID];

	let btnDiv = e.target.parentElement;

	if (btnDiv.classList == "stopBtn") { // if task is running while you press edit to stops the task
		Task.Running = false;
		changeLog(Task, 'Stopping', "orange");
		e.target.src = "./images/play-img.png";
		btnDiv.classList = "runBtn";
		ipc.send('stop-task', Task);
	}

	let addTaskModal = document.getElementById("addTaskModal");
	addTaskModal.style.display = "block";


	//document.getElementById("site").value = Task.Site;
	if (Task.ItemURL == false) {
		document.getElementById("PosKeywrd").value = Task.Positive_Keywords;
		document.getElementById("negKeywrd").value = Task.Negative_Keywords;
	} else if (Task.Positive_Keywords == false) {
		document.getElementById("itemUrl").value = Task.ItemURL;
	}
	document.getElementById("size").value = Task.Size;
	//document.getElementById("anysize").value = Task.AnySize; //this wont do anything;
	document.getElementById("color").value = Task.Color;
	//document.getElementById("anycolor").value;
	document.getElementById("profile").value = Task.Profile;
	//document.getElementById("proxy").value = Task.Proxy;
	document.getElementById("date").value = Task.Date;
	document.getElementById("time").value = Task.Time;
	document.getElementById("checkoutDelay").value = Task.Delay;
	//document.getElementById("taskMode").value;

	let reSaveTask = document.getElementById("reSaveTask");
	document.getElementById("saveTaskBtn").style.display = "none";
	reSaveTask.style.display = "block";

	reSaveTask.addEventListener('click', () => {
		Task.Site = document.getElementById("site").value;
		if (document.getElementById("itemUrl").value == "") {
			Task.Positive_Keywords = document.getElementById("PosKeywrd").value;
			Task.Negative_Keywords = document.getElementById("negKeywrd").value;
		} else if (document.getElementById("PosKeywrd").value == "") {
			Task.ItemURL = document.getElementById("itemUrl").value;
		} else {
			alert('you added in info for url and keywords, pick one.');
			return false;
		}
		Task.Size = document.getElementById("size").value;

		if (document.getElementById("anysize").value == "Enabled") {
			Task.AnySize = true;
		}
		Task.Color = document.getElementById("color").value;

		if (document.getElementById("anycolor").value == "Enabled") {
			Task.AnyColor = true;
		}
		Task.Profile = document.getElementById("profile").value;
		Task.Proxy = document.getElementById("proxy").value;
		Task.Date = document.getElementById("date").value;
		Task.Time = document.getElementById("time").value;
		Task.TaskMode = document.getElementById("taskMode").value;
		Task.Delay = document.getElementById("checkoutDelay").value;

		document.getElementById("category").value = "";
		document.getElementById("jsonType").value = "";
		document.getElementById("taskMode").value = "";
		document.getElementById("itemUrl").value = "";
		document.getElementById("PosKeywrd").value = "";
		document.getElementById("negKeywrd").value = "";
		document.getElementById("color").value = "";
		document.getElementById("size").value = "";
		document.getElementById("profile").value = "";
		document.getElementById("proxy").value = "";
		document.getElementById("date").value = "";
		document.getElementById("time").value = "";
		document.getElementById("checkoutDelay").value = "";

		addTaskModal.style.display = "none";
		localStorage.removeItem("TaskCollection");
		localStorage.setItem("TaskCollection", JSON.stringify(tasksArray));
		loadTasks();
	});
}

function removeTask(e) {
	let clickedID = Number(e.target.parentElement.id) - 1;
	let tasksArray = JSON.parse(localStorage.getItem("TaskCollection"));
	let removedTask = tasksArray.splice(clickedID, 1);
	localStorage.removeItem("TaskCollection");
	localStorage.setItem("TaskCollection", JSON.stringify(tasksArray));
	loadTasks();
}

function addTaskToTable(Task) {

	let rows_count = document.getElementById("task-table").rows.length;
	let tableRow = document.createElement('tr');
	let id = document.createElement('td');
	let store = document.createElement('td');
	let monitor = document.createElement('td');
	let size = document.createElement('td');
	let color = document.createElement('td');
	let profile = document.createElement('td');
	let proxy = document.createElement('td');
	let log = document.createElement('td');
	log.classList.add('task-log');

	id.innerHTML = rows_count;

	/*
	let storeSplit = Task.Site.split("//")
	storeSplit = storeSplit[1].split(".")
	store.innerHTML = storeSplit[0];
	takes https://website.com
	and returns website
	*/
	store.innerHTML = Task.Site;
	if (Task.AnySize == true) {
		size.innerHTML = Task.Size + ' +Any';
	} else {
		size.innerHTML = Task.Size;
	}
	if (Task.AnyColor == true) {
		color.innerHTML = Task.Color + ' +Any';
	} else {
		color.innerHTML = Task.Color;
	}

	proxy.innerHTML = Task.Proxy;
	log.innerHTML = Task.Status

	if (!Task.Positive_Keywords) {
		monitor.innerHTML = Task.ItemURL.split("https://www.supremenewyork.com/shop/")[1];
	} else if (Task.Positive_Keywords) {
		monitor.innerHTML = "+" + Task.Positive_Keywords + " -" + Task.Negative_Keywords;
	}
	profile.innerHTML = Task.Profile;
	log.innerHTML = "Idle";
	log.style.width = "170px";

	let runBtn = document.createElement('button');
	let editBtn = document.createElement('button');
	let removeBtn = document.createElement('button');
	if (!Task.Running) {
		runBtn.classList.add('runBtn');
		runBtn.innerHTML = '<img class="actions-img" src="./images/play-img.png" />';
	} else {
		runBtn.classList.add('stopBtn');
		runBtn.innerHTML = '<img class="actions-img" src="./images/stop-img.png" />';
	}
	editBtn.classList.add('editBtn');
	removeBtn.classList.add('removeBtn');
	runBtn.id = rows_count;
	removeBtn.id = rows_count;
	editBtn.id = rows_count;
	editBtn.innerHTML = '<img class="actions-img" src="./images/edit-img.png" />';
	removeBtn.innerHTML = '<img class="actions-img" src="./images/delete-img.png" />';

	runBtn.addEventListener("click", (e) => {
		runTask(e, ipc);
	});

	editBtn.addEventListener("click", (e) => {
		editTask(e, ipc);
	});

	removeBtn.addEventListener("click", (e) => {
		removeTask(e, ipc);
	});

	let all_tasks = JSON.parse(localStorage.getItem("TaskCollection"));
	localStorage.removeItem("TaskCollection");

	if (rows_count < 10) {
		all_tasks[rows_count - 1].Id = "0" + rows_count;
	} else {
		all_tasks[rows_count - 1].Id = rows_count.toString();
	}

	localStorage.setItem("TaskCollection", JSON.stringify(all_tasks));

	let actionsTd = document.createElement("td");

	//actionsTd.style.backgroundColor = "#27223d";

	actionsTd.appendChild(runBtn);
	actionsTd.appendChild(editBtn);
	actionsTd.appendChild(removeBtn);
	tableRow.appendChild(id);
	tableRow.appendChild(store);
	tableRow.appendChild(size);
	tableRow.appendChild(monitor);
	tableRow.appendChild(color);
	tableRow.appendChild(profile);
	tableRow.appendChild(proxy);
	tableRow.appendChild(log);
	tableRow.append(actionsTd);
	document.getElementById("task-table").tBodies[0].appendChild(tableRow);
}

function addProxiesToTasks() {
	let Proxies = JSON.parse(localStorage.getItem("ProxyCollection"));
	let Tasks = JSON.parse(localStorage.getItem("TaskCollection"));
	if (Proxies) {
		let proxy_count = Array.from(Array(Proxies.length).keys());
		// example proxy count is 3 creates array [0,1,2]
		for (var i = 0; i < Tasks.length; i++) {
			if (Tasks[i].Proxy != "localhost") {
				let proxyStr;
				let x = proxy_count[0];
				if (Proxies[x].Username) {
					proxyStr = Proxies[x].Ip + ":" + Proxies[x].Port + ":" + Proxies[x].Username + ":" + Proxies[x].Password;
				} else {
					proxyStr = Proxies[x].Ip + ":" + Proxies[x].Port
				}
				proxy_count.splice(0, 1); // removes the proxy that was used aka the first proxy in the array
				Tasks[i].Proxy = proxyStr;
			}
		}
	}

	localStorage.removeItem("TaskCollection");
	localStorage.setItem("TaskCollection", JSON.stringify(Tasks));
	return JSON.parse(localStorage.getItem("TaskCollection"));
}
/*
let refresh_tasks = document.getElementById("refresh-tasks");
refresh_tasks.addEventListener('click', () => {
	console.log('refreshing tasks page');
	loadTasks();
});
*/
let massEditBtn = document.getElementById("massEditTasks");
let massEditModal = document.getElementById("massEditModal");
massEditBtn.addEventListener('click', () => {
	massEditModal.style.display = 'block';
});

let massEditGo = document.getElementById("saveMassEdit");
massEditGo.addEventListener('click', () => {


	let monitor = document.getElementById("mass-monitor").value;

	let color = document.getElementById("mass-color").value;

	let size = document.getElementById("mass-size").value;

	//let taskMode = document.getElementById("taskMode").value;

	//let allInputs = [siteType, site, itemUrl, posKeywrd, negKeywrd, size, anySize, color, anyColor, proxy, date, time, taskMode];

	let allTasks = JSON.parse(localStorage.getItem("TaskCollection"));

	allTasks.forEach((Task) => {

		if (monitor.includes("http")) {
			Task.ItemURL = monitor;
			Task.Positive_Keywords = false;
			Task.Negative_Keywords = false;
		} else if (monitor.includes("+")) {
			let splitMonitor = monitor.split(',');
			let negatives = [];
			splitMonitor.forEach((part) => {
				if (part.includes("+")) {
					Task.Positive_Keywords = part.split("+")[1];
				} else if (part.includes("-")) {
					negatives.push(part.split("-")[1]);
				}
			});
			Task.Negative_Keywords = "";
			for (i = 0; i < negatives.length; i++) {

				if (i == negatives.length - 1) {
					Task.Negative_Keywords += negatives[i];
				} else {
					Task.Negative_Keywords += negatives[i] + ',';
				}
			}
			Task.ItemURL = false;
		}

		if (color.length > 0) {
			Task.Color = color;
		}
		if (size.length > 0) {
			Task.Size = size;
		}
	});

	localStorage.removeItem("TaskCollection");
	localStorage.setItem("TaskCollection", JSON.stringify(allTasks));

	document.getElementById("mass-monitor").value = "";
	document.getElementById("mass-color").value = "";
	document.getElementById("mass-size").value = "";
	massEditModal.style.display = 'none';
	loadTasks();
});

let closeMass = document.getElementById("closeMassEdit");
closeMass.addEventListener('click', () => {
	massEditModal.style.display = 'none';
});

let captchaBtn = document.getElementById("captchaTasks");
captchaBtn.addEventListener('click', () => {
	//ipc.send('open-captcha');
	var website = {
		sitekey: '6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz',
		url: 'supremenewyork.com',
		port: 3000
	}

	app.use(bodyParser.urlencoded({
		extended: false
	}))

	app.listen(website.port, () => console.log(website.port))
	app.get('/', function (req, res) {
		res.send(`<!DOCTYPE HTML>
		<html>
			<head>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
				<title>Captcha Harvester</title>
			</head>
			<body style="background-color: #26223d;">

				<img style="position: absolute;top:20%;left:15%;height:50%;width:65%;" id="captcha-back-img" src="https://cdn.discordapp.com/attachments/635280134080823309/643645123825238016/captcha-back.png"></img>

				<div class="g-recaptcha" data-callback="sendToken" data-sitekey="${website.sitekey}" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);"></div>
				<script>
					function sendToken()
					{
						post('/', {'g-recaptcha-response': grecaptcha.getResponse()});
					}
					function post(path, params, method) {
						method = method || "post"; // Set method to post by default if not specified.
		
						// The rest of this code assumes you are not using a library.
						// It can be made less wordy if you use one.
						var form = document.createElement("form");
						form.setAttribute("method", method);
						form.setAttribute("action", path);
		
						for(var key in params) {
							if(params.hasOwnProperty(key)) {
								var hiddenField = document.createElement("input");
								hiddenField.setAttribute("type", "hidden");
								hiddenField.setAttribute("name", key);
								hiddenField.setAttribute("value", params[key]);
		
								form.appendChild(hiddenField);
							}
						}
		
						document.body.appendChild(form);
						form.submit();
					}
				</script>
				<script src='https://www.google.com/recaptcha/api.js'></script>
			</body>
		</html>`)
	})
	app.post('/', function (request, response) {
		console.log(request.body);
		console.log(request.body['g-recaptcha-response']);
		ipc.send('captcha-token', request.body);
		response.redirect('/');
	})
	/*
	sudo nano /etc/hosts
	manually add in 127.0.01 captcha.supremenewyork.com
	 
	dont know if need this:

	if hosts file does not have 

	127.0.0.1	supremenewyork.com

	add it
	*/
	console.log(hostile);
	hostile.set('127.0.0.1', 'supremenewyork.com', function (err) {
		if (5 < 4) {
			console.error(err);
		} else {
			console.log('set /etc/hosts successfully!');
		}
	});
	//If the rule already exists, then this does nothing.


	hostile.set('::1', 'captcha.' + website.url, function (err) {
		if (5 < 4) { // if err  need to somehow give node sudo permissions to edit users hosts file
			console.error(err);
		} else {
			ipc.send('open-captcha', website);
			//window.open('http://captcha.' + website.url + ':' + website.port);
		}
	})
});



let addTaskBtn = document.getElementById("addTaskBtn");
let addTaskModal = document.getElementById("addTaskModal");
addTaskBtn.addEventListener('click', () => {
	addTaskModal.style.display = 'block';
	document.getElementById("saveTaskBtn").style.display = "block";
	document.getElementById("reSaveTask").style.display = "none";

	let saved_profiles = JSON.parse(localStorage.getItem("billingProfiles"));
	if (saved_profiles) {
		let select_profile = document.getElementById("profile");
		select_profile.options.length = 1;
		saved_profiles.forEach(function (profile) {
			let selectOpt = document.createElement('option');
			selectOpt.appendChild(document.createTextNode(profile.Name));
			selectOpt.value = profile.Name;
			select_profile.append(selectOpt);
		});
	}
});

let saveTaskBtn = document.getElementById("saveTaskBtn");
saveTaskBtn.addEventListener('click', () => {
	let table_length = document.getElementById("task-table").rows.length;
	let site = document.getElementById("site").value;
	let siteType = document.getElementById("site").options[0].parentElement.label;
	let itemUrl;
	itemUrl = document.getElementById("itemUrl").value;
	if (itemUrl.length == 0) {
		itemUrl = false;
	}
	let jsonType = document.getElementById("jsonType").value;
	let category = document.getElementById("category").value;
	let posKeywrd;
	let negKeywrd;
	posKeywrd = document.getElementById("PosKeywrd").value;
	negKeywrd = document.getElementById("negKeywrd").value;
	if (posKeywrd.length == 0 && negKeywrd.length == 0) {
		posKeywrd = false;
		negKeywrd = false;
	}
	let size = document.getElementById("size").value;
	let any_size = document.getElementById("anysize").value;
	let anySize;
	if (any_size == "Enabled") {
		anySize = true;
	} else if (any_size == "Disabled") {
		anySize = false;
	}
	let color = document.getElementById("color").value;
	let any_color = document.getElementById("anycolor").value;
	let anyColor;
	if (any_color == "Enabled") {
		anyColor = true;
	} else if (any_color == "Disabled") {
		anyColor = false;
	}
	let profile = document.getElementById("profile").value;
	let proxy = document.getElementById("proxy").value;
	let date = document.getElementById("date").value;
	let time = document.getElementById("time").value;

	let taskMode = document.getElementById("taskMode").value;
	let checkoutDelay;
	if (!checkoutDelay) {
		checkoutDelay = 0;
	} else {
		checkoutDelay = document.getElementById("checkoutDelay").value;
	}

	let allTasks;
	allTasks = JSON.parse(localStorage.getItem("TaskCollection"));

	if (allTasks == null) {
		localStorage.setItem("TaskCollection", JSON.stringify([]));
		allTasks = JSON.parse(localStorage.getItem("TaskCollection"));
	}
	let newTaskId;
	if (table_length < 10) {
		newTaskId = "0" + table_length;
	} else {
		newTaskId = table_length;
	}

	if (!itemUrl && !posKeywrd) {
		alert("Please use a keyword or url when creating a task.");
		return false;
	}
	if (!color && !anyColor) {
		alert("Please specify a color or enable any-color.");
		return false;
	}
	if (!size && !anySize) {
		alert("Please specify a size or enable any-size.");
		return false;
	}

	let newTask = {
		"Type": siteType,
		"Id": newTaskId,
		"Site": site,
		"ItemURL": itemUrl,
		"JsonType": jsonType,
		"Category": category,
		"Positive_Keywords": posKeywrd,
		"Negative_Keywords": negKeywrd,
		"Size": size,
		"AnySize": anySize,
		"Color": color,
		"AnyColor": anyColor,
		"Delay": checkoutDelay,
		"Profile": profile,
		"Proxy": proxy,
		"Date": date,
		"Time": time,
		"TaskMode": taskMode,
		"Running": false
	};
	console.log(newTask);
	allTasks.push(newTask);
	localStorage.removeItem("TaskCollection");
	localStorage.setItem("TaskCollection", JSON.stringify(allTasks));
	/*
	document.getElementById("itemUrl").value = "";
	document.getElementById("PosKeywrd").value = "";
	document.getElementById("negKeywrd").value = "";
	size = "";
	document.getElementById("anysize").value = "";
	profile = "";
	proxy = "";
	date = "";
	time = "";
	addTaskModal.style.display = 'none';
	*/
	loadTasks();
});

let closeTaskBtn = document.getElementById("closeTaskBtn");
closeTaskBtn.addEventListener('click', () => {
	document.getElementById("category").value = "";
	document.getElementById("jsonType").value = "";
	document.getElementById("taskMode").value = "";
	document.getElementById("itemUrl").value = "";
	document.getElementById("PosKeywrd").value = "";
	document.getElementById("negKeywrd").value = "";
	document.getElementById("color").value = "";
	document.getElementById("size").value = "";
	document.getElementById("profile").value = "";
	document.getElementById("proxy").value = "";
	document.getElementById("date").value = "";
	document.getElementById("time").value = "";
	document.getElementById("checkoutDelay").value = "";
	addTaskModal.style.display = 'none';
});

let startAllBtn = document.getElementById("runAllTasks");
startAllBtn.addEventListener('click', () => {
	let tasksArray = JSON.parse(localStorage.getItem("TaskCollection"));
	let tableRows = document.getElementById("task-table").tBodies[0].rows
	for (i = 0; i < tableRows.length; i++) {
		let tableRowLogs = tableRows[i].cells[7].innerHTML;
		if (tableRowLogs == "Idle") {
			let editBtns = document.getElementsByClassName("runBtn")[0];
			editBtns.children[0].src = "./images/stop-img.png"; // cannot read children of undefined, something weird going on witht he [0] of the class btns but it works so....
			editBtns.classList = "stopBtn";
			changeLog(tasksArray[i], "Searching", "white");
			ipc.send('run-task', tasksArray[i]);
		}
	}
});

let stopAllBtn = document.getElementById("stopAllTasks");
stopAllBtn.addEventListener('click', () => {
	let tasksArray = JSON.parse(localStorage.getItem("TaskCollection"));
	let tableRows = document.getElementById("task-table").tBodies[0].rows
	for (i = 0; i < tableRows.length; i++) {
		let tableRowLogs = tableRows[i].cells[7].innerHTML;
		if (tableRowLogs != "Idle") {
			let editBtns = document.getElementsByClassName("stopBtn")[0];
			editBtns.children[0].src = "./images/play-img.png"; // cannot read children of undefined, something weird going on witht he [0] of the class btns but it works so....
			editBtns.classList = "runBtn";
			changeLog(tasksArray[i], "Stopping", "orange");
			ipc.send('stop-task', tasksArray[i]);
		}
	}
});

let deleteAllBtn = document.getElementById("deleteAllTasks");
deleteAllBtn.addEventListener('click', () => {
	let r_u_sure = confirm("Are you sure you want to delete all of your tasks?");
	if (r_u_sure) {
		let tasksArray = [];
		localStorage.removeItem("TaskCollection");
		localStorage.setItem("TaskCollection", JSON.stringify(tasksArray));
		loadTasks();
	}
});

