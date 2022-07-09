const open = require("open");
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const hostile = require('hostile')

var website = {
	sitekey: '6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz',
	url: 'supremenewyork.com',
	port: 3000
}

app.use(bodyParser.urlencoded({
	extended: false
}))

app.listen(website.port, () => console.log('Listening on port ' + website.port))
app.get('/', function (req, res) {
	res.send(`<!DOCTYPE HTML>
	<html>
		<head>
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
			<title>Captcha Harvester</title>
		</head>
		<body style="background-color: #303030;">
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
	response.redirect('/');
})
/*
hostile.set('127.0.0.1', 'supremenewyork.com', function (err) {
  if (err) {
    console.error(err)
  } else {
    console.log('set /etc/hosts successfully!')
  }
})
*/

hostile.set('::1', 'captcha.' + website.url, function (err) {
	if (5<4) {
		console.error(err);
	} else {
		//ipc.send('open-captcha', website);
		window.open('http://captcha.' + website.url + ':' + website.port);
	}
})