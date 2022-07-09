window.onload = loadProfiles();

function loadProfiles() {
	//ipc.send('load-TasksB');
	let profilesArray = JSON.parse(localStorage.getItem("billingProfiles"));
	if (profilesArray) {
		console.log(profilesArray);
		document.getElementById("profiles-table").tBodies[0].innerHTML = "";
		profilesArray.forEach(function(profile) {
			loadProfile(profile);
		});
	}
}

function editProfile(e) {
	let clickedID = Number(e.target.parentElement.id)-1;
	let profilesArray = JSON.parse(localStorage.getItem("billingProfiles"));
	let profile = profilesArray[clickedID];

	document.getElementById("profileName").value = profile.Name;
	document.getElementById("name").value = profile.FullName;
	document.getElementById("address").value = profile.Address;
	document.getElementById("apt").value = profile.Apt;
	document.getElementById("city").value = profile.City;
	document.getElementById("state").value = profile.State;
	document.getElementById("country").value = profile.Country;
	document.getElementById("zip").value = profile.Zip;
	document.getElementById("num").value = profile.Card;
	document.getElementById("expM").value = profile.Month;
	document.getElementById("expY").value = profile.Year;
	document.getElementById("CVV").value = profile.Cvv;
	document.getElementById("cardName").value = profile.CardName;
	document.getElementById("email").value = profile.Email;
	document.getElementById("phone").value = profile.Phone;

	document.getElementById("reSave").style.display = "block";
	document.getElementById("createBill").style.display = "none";

	let reSaveBtn = document.getElementById("reSave");
	reSaveBtn.addEventListener('click', () => {

		let profile_name = document.getElementById("profileName").value;
		let name = document.getElementById("name").value;
		let address = document.getElementById("address").value;
		let apt = document.getElementById("apt").value;
		let city = document.getElementById("city").value;
		let state = document.getElementById("state").value;
		let country = document.getElementById("country").value;
		let zip = document.getElementById("zip").value;
		let card = document.getElementById("num").value;
		let month = document.getElementById("expM").value;
		let year = document.getElementById("expY").value;
		let cvv = document.getElementById("CVV").value;
		let card_name = document.getElementById("cardName").value;
		let email = document.getElementById("email").value;
		let phone = document.getElementById("phone").value;

		profile.Name = profile_name;
		profile.FullName = name;
		profile.Address = address;
		profile.Apt = apt;
		profile.City = city;
		profile.State = state;
		profile.Country = country;
		profile.Zip = zip;
		profile.Card = card;
		profile.Month = month;
		profile.Year = year;
		profile.Cvv = cvv;
		profile.CardName = card_name;
		profile.Email = email;
		profile.Phone = phone;

		document.getElementById("profileName").value = "";
		document.getElementById("name").value = "";
		document.getElementById("address").value = "";
		document.getElementById("apt").value = "";
		document.getElementById("city").value = "";
		document.getElementById("state").value = "";
		document.getElementById("country").value = "";
		document.getElementById("zip").value = "";
		document.getElementById("num").value = "";
		document.getElementById("expM").value = "";
		document.getElementById("expY").value = "";
		document.getElementById("CVV").value = "";
		document.getElementById("cardName").value = "";
		document.getElementById("email").value = "";
		document.getElementById("phone").value = "";
		console.log(document.getElementById("profileName").value);

		document.getElementById("reSave").style.display = "none";
		document.getElementById("createBill").style.display = "block";

		localStorage.removeItem("billingProfiles");
		localStorage.setItem("billingProfiles", JSON.stringify(profilesArray));
		loadProfiles();
	});
}
function removeProfile(e) {
	let clickedID = Number(e.target.parentElement.id)-1;
	let profilesArray = JSON.parse(localStorage.getItem("billingProfiles"));
	let removedProfile = profilesArray.splice(clickedID, 1);
	localStorage.removeItem("billingProfiles");
	localStorage.setItem("billingProfiles", JSON.stringify(profilesArray));
	loadProfiles();
}

function loadProfile(profile) {
	let count = document.getElementById("profiles-table").rows.length;
	
	let profile_name = document.createElement('td');
	profile_name.innerHTML = profile.Name;
	let email = document.createElement('td');
	email.innerHTML = profile.Email;
	let cardName = document.createElement('td');
	cardName.innerHTML = profile.CardName;
	let card = document.createElement('td');
	card.innerHTML = profile.Card.slice(12);

	let buttons = document.createElement('td');

	let edit_btn = document.createElement('button');
	edit_btn.id = count;
	edit_btn.style.backgroundColor = "transparent";
	edit_btn.style.border = "none";
	edit_btn.innerHTML = '<img class="actions-img" src="./images/edit-img.png" />';
	let delete_btn = document.createElement('button');
	delete_btn.id = count;
	delete_btn.style.backgroundColor = "transparent";
	delete_btn.style.border = "none";
	delete_btn.innerHTML = '<img class="actions-img" src="./images/delete-img.png" />';

	edit_btn.addEventListener("click", (e)=> {
		editProfile(e);
	});

	delete_btn.addEventListener("click", (e)=> {
		removeProfile(e);
	});

	let tableBody = document.getElementById("profiles-table").tBodies[0];
	let tableRow = document.createElement('tr');
	let actionsTd = document.createElement("td");
	actionsTd.appendChild(edit_btn);
	actionsTd.appendChild(delete_btn);
	tableRow.appendChild(profile_name);
	tableRow.appendChild(email);
	tableRow.appendChild(cardName);
	tableRow.appendChild(card);
	tableRow.append(actionsTd);
	tableBody.appendChild(tableRow);
}


let createBtn = document.getElementById("createBill");
createBtn.addEventListener('click', () => {
	let profile_name = document.getElementById("profileName").value;
	let name = document.getElementById("name").value;
	let address = document.getElementById("address").value;
	let apt = document.getElementById("apt").value;
	let city = document.getElementById("city").value;
	let state = document.getElementById("state").value;
	let country = document.getElementById("country").value;
	let zip = document.getElementById("zip").value;
	let card = document.getElementById("num").value;
	let month = document.getElementById("expM").value;
	let year = document.getElementById("expY").value;
	let cvv = document.getElementById("CVV").value;
	let card_name = document.getElementById("cardName").value;
	let email = document.getElementById("email").value;
	let phone = document.getElementById("phone").value;

	document.getElementById("profileName").value = "";
	document.getElementById("name").value = "";
	document.getElementById("address").value = "";
	document.getElementById("apt").value = "";
	document.getElementById("city").value = "";
	document.getElementById("state").value = "";
	document.getElementById("country").value = "";
	document.getElementById("zip").value = "";
	document.getElementById("num").value = "";
	document.getElementById("expM").value = "";
	document.getElementById("expY").value = "";
	document.getElementById("CVV").value = "";
	document.getElementById("cardName").value = "";
	document.getElementById("email").value = "";
	document.getElementById("phone").value = "";

	let billing = ({
		"Name": profile_name,
		"FullName": name,
		"Address": address,
		"Apt": apt,
		"City": city,
		"State": state,
		"Country": country,
		"Zip": zip,
		"Card": card,
		"Month": month,
		"Year": year,
		"Cvv": cvv,
		"CardName": card_name,
		"Email": email,
		"Phone": phone
	});

	let billingArray;
	billingArray = JSON.parse(localStorage.getItem("billingProfiles"));
	if (billingArray == null) {
		localStorage.setItem("billingProfiles", "[]");
		billingArray = JSON.parse(localStorage.getItem("billingProfiles"));
	}
	billingArray.push(billing);
	localStorage.removeItem("billingProfiles");
	localStorage.setItem("billingProfiles", JSON.stringify(billingArray));
	loadProfiles();
});