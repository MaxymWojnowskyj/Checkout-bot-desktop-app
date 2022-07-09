

let deactivate = document.getElementById("deactivate");
deactivate.addEventListener('click', () => { 
	ipc.send("logout");
});

let saveHook = document.getElementById("save-webhook");
saveHook.addEventListener('click', () => { 
	let hook = document.getElementById("webhook").value;
	localStorage.setItem("Webhook", hook);
	saveHook.innerHTML = "Saved Hook";
	document.getElementById("webhook").disabled = true;
});

let clearHook = document.getElementById("clear-webhook");
clearHook.addEventListener('click', () => { 
	document.getElementById("webhook").value = "";
	localStorage.removeItem("Webhook");
	saveHook.innerHTML = "Save Hook";
	document.getElementById("webhook").disabled = false;
});



let shhh = document.getElementById("secretBtn");
let secretModal = document.getElementById("secretModal")
shhh.addEventListener('click', () => { 
	secretModal.style.display = "block";
});
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
  secretModal.style.display = "none";
}