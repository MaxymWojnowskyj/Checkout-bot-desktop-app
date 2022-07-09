const Fuse = require('fuse.js');
const rp = require('request-promise').defaults({jar:cookieJar})
var cookieJar = rp.jar();
var bTask = {"Error": 1500};
let error = document.getElementById("retry").value;
    if (error) {
        bTask = {"Error": error}; 
    }

/*
    good idea for actions log:

    since the log changes too fast to see add a :hover over log 
    then modal or div appears that shows the log history

    NOTE: If not getting back stop task when called add this to the code the bot is stuck on:

    for (var i = stopTask.length -1; i >= 0; i--) {
        if (stopTask[i] == Task.Id) {
            let removed = stopTask.splice(i, 1);
            ipc.send('task-stoppedB', Task);
            return false;
        }
    }
*/

 
ipc.on('Supreme', function (event, Task) {

    let proxyUrl;
    if (Task.Proxy.split(":").length > 0) {
        let proxyParts = Task.Proxy.split(":");
        if (proxyParts.length > 1) {
            proxyUrl = "http://" + proxyParts[2] + ":" + proxyParts[3] + "@" + proxyParts[0] + ":" + proxyParts[1];
        } else if (Task.Proxy != "localhost"){
            proxyUrl = "http://" + proxyParts[0] + ":" + proxyParts[1];
        }
    } else if (Task.Proxy == "localhost"){
        proxyUrl = "http://127.0.0.0";
    } else if (Task.Proxy == "proxy fill") {
        ipc.send('no-proxyB', Task);
        return false;
    }

    if (Task.Positive_Keywords != false) {
    	keywordStart(Task, proxyUrl);
    } else { //user uses URL
    	getItemColor(Task, Task.ItemURL, proxyUrl);
    }

});
let stopTask = [];
ipc.on('Supreme Stop', function (event, Task) {
    stopTask.push(Task.Id);
});
let captcha_tokens = [];
ipc.on('captcha-tokenB', function (event, Token) {
    let current_token = Token['g-recaptcha-response'];
    captcha_tokens.push(current_token);
    console.log(captcha_tokens);

    setTimeout(function () { // if token still in array after 2 mins remove it
        if (captcha_tokens.includes(current_token)) {
            captcha_tokens.splice(captcha_tokens.indexOf(current_token),1);
        }
    }, 120000);

});

function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));    
        } else 
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}

function keywordStart(Task, proxyUrl) {

    for (var i = stopTask.length -1; i >= 0; i--) {
        if (stopTask[i] == Task.Id) {
            stopTask.splice(i, 1);
            ipc.send('task-stoppedB', Task);
            return false;
        }
    }

    let o = (new Date).getTime();

    let header = {
        'authority': 'www.supremenewyork.com',
        'path': `${Task.JsonType}.json`,
        'scheme': 'https',
        "accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        //'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
    }

    let getItems = {
        method: 'GET',
        uri: `https://www.supremenewyork.com/${Task.JsonType}.json?_=` + o,
        headers: header,
        proxy: proxyUrl,
       // body: metadata,
        json: true,
        resolveWithFullResponse: true,
        jar: cookieJar
    }

    rp(getItems)
        .then(function (response) {
            if (response.statusCode == 200) {
                let json = response.body;
                var options = {
                    caseSensitive: true,
                   //shouldSort: true,
                    threshold: 0.6,
                    location: 0,
                    distance: 100,
                    maxPatternLength: 32,
                    minMatchCharLength: 1,
                    keys: ['name'],
                    id: 'id'
                };
                  //let category = (data.task[atc_count][3]);
                let f = new Fuse(json.products_and_categories[Task.Category], options); 
                let item = f.search(Task.Positive_Keywords);

                let z = new Fuse(item, options);
                let negs = Task.Negative_Keywords.split(",");
                let matching_negs = [];
                for (i = 0; i < negs.length; i++) {
                    matching_negs.push(z.search(negs[i].toLowerCase())[0]);
                }

                var id = item.filter(function (items, i) { // this sometimes returns all items back instead of only the one that doesnt match the negative item
                    return items != matching_negs[i];
                });

                var itemURL = "https://www.supremenewyork.com/shop/" + id[0];
                  
                if (id.length === 0) {

                    console.log('was not found retyring..');
                    
                    setTimeout(function () {
                        ipc.send('retryingB', Task);
                        keywordStart(Task, proxyUrl);
                    }, bTask.Error);
                    
                } else {
                    let name = getObjects(json.products_and_categories[Task.Category], 'id', id[0]);
                    console.log(name[0]['name'] + 'found!');
                    ipc.send('item-foundB', name[0]['name'], Task);

                    getItemColor(Task, itemURL, proxyUrl);
                }
            }
        })
        .catch(function (err) {

            console.log(`ERROR: get color URL request failed`);
            console.log(err)

        });

}

function getItemColor(Task, ItemURL, proxyUrl) {
    for (var i = stopTask.length -1; i >= 0; i--) {
        if (stopTask[i] == Task.Id) {
            let removed = stopTask.splice(i, 1);
            ipc.send('task-stoppedB', Task);
            return false;
        }
    }

    let header = {
        'authority': 'www.supremenewyork.com',
        'path': `${ItemURL.split("https://www.supremenewyork.com")[1]}.json`,
        'scheme': 'https',
        "accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        //'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'referer': `${ItemURL}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
    }


    let getColor = {
        method: 'GET',
        uri: `${ItemURL}.json`,
        headers: header,
        proxy: proxyUrl,
       // body: metadata,
        json: true,
        resolveWithFullResponse: true,
        jar: cookieJar
    }

    rp(getColor)
        .then(function (response) {
            if (response.statusCode == 200) {

                let allStyles = response.body.styles;
                let colorJson;

                for (var i = 0; i < allStyles.length; i++) {
                    if (allStyles[i].name.toLowerCase() == Task.Color.toLowerCase()) {
                        colorJson = allStyles[i];
                        ipc.send('color-foundB', colorJson.name, Task);

                        if (ItemURL.length > 42) { // if user usses actual url for task
                            let id_part = colorJson.image_url.split("//assets.supremenewyork.com/")[1];
                            let item_id = "https://www.supremenewyork.com/shop/"+id_part.split("/sm/")[0];
                            getItemSize(Task, item_id, colorJson, proxyUrl);
                        } else {
                            getItemSize(Task, ItemURL, colorJson, proxyUrl);
                        }

                        break;
                    }
                }
                if (!colorJson && Task.AnyColor == true) {
                    let randomNum = Math.floor(Math.random() * Math.floor(allStyles.length)); // random number between 0 and the length of the colors
                    colorJson = allStyles[randomNum];
                    ipc.send('color-insteadB', colorJson.name, Task);
                    if (ItemURL.length > 42) { // if user usses actual url for task
                        let id_part = colorJson.image_url.split("//assets.supremenewyork.com/")[1];
                        let item_id = "https://www.supremenewyork.com/shop/"+id_part.split("/sm/")[0];
                        getItemSize(Task, item_id, colorJson, proxyUrl);
                    } else {
                        getItemSize(Task, ItemURL, colorJson, proxyUrl);
                    }

                } else if (!colorJson && Task.AnyColor == false){
                    console.log('color not found');
                    ipc.send('color-notFoundB', Task.Color, Task);
                }
            }
        })
        .catch(function (err) {

            console.log(`ERROR: get color URL request failed`);
            console.log(err)

        });
}
function getItemSize(Task, ItemURL, colorJson, proxyUrl) {
    let sizes = colorJson.sizes;
    let sizeJson;

    if (Task.Size == "One Size" && sizes[0]) {
        sizeJson = sizes[0];
        ipc.send('size-foundB', sizeJson.name, Task);
        addToCart(Task, ItemURL, colorJson.id, sizeJson.id, proxyUrl);
    }
    for (var i = 0; i < sizes.length; i++) {
        if (sizes[i].name.toLowerCase() == Task.Size.toLowerCase()) { // toLowerCase isnt really neccecary but better safe than sorry
            sizeJson = sizes[i];
            ipc.send('size-foundB', sizeJson.name, Task);
            addToCart(Task, ItemURL, colorJson.id, sizeJson.id, proxyUrl);
            break;
        }
    }
    if (!sizeJson && Task.AnySize == true) {
        let randomNum = Math.floor(Math.random() * Math.floor(sizes.length)); // random number between 0 and the length of the colors
        sizeJson = sizes[randomNum];
        ipc.send('size-insteadB', sizeJson.name, Task);
        addToCart(Task, ItemURL, colorJson.id, sizeJson.id, proxyUrl);
        //getItemSize(Task, ItemURL, colorJson);
    } else if (!sizeJson && Task.AnySize == false){
        ipc.send('size-notFoundB', Task.Size, Task);
    }
}

function addToCart(Task, ItemURL, colorId, sizeId, proxyUrl) {

    for (var i = stopTask.length -1; i >= 0; i--) {
        if (stopTask[i] == Task.Id) {
            let removed = stopTask.splice(i, 1);
            ipc.send('task-stoppedB', Task);
            return false;
        }
    }

    //add something that switches mobile user-agent

    let header = {
        'authority': 'www.supremenewyork.com',
        'scheme': 'https',
        "accept": '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
        //'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'www.supremenewyork.com',
        //iphone userAgent below
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'
    }
    let formData = {
        'utf8': '✓',
        'st': colorId,
        's': sizeId,
        'commit': 'add to cart'
    }

    let ATC = {
        method: 'POST',
        uri: `${ItemURL}/add.json`,
        headers: header,
        form: formData,
        proxy: proxyUrl,
        json: true,
        resolveWithFullResponse: true,
        jar: cookieJar
    }

    rp(ATC)
        .then(function (response) {
            if (response.statusCode == 200) {
                console.log(response);
                ipc.send('atcB', Task);
                /*
                not sure where where or if they want this
                will log immediately after atc log so you wont be able to see the atc log
                ipc.send('delayingB', Task);
                */
                setTimeout(function () {
                    checkout(Task, sizeId, proxyUrl);
                }, Task.Delay);
            }
            
        })
        .catch(function (err) {

            console.log(`ERROR: get color URL request failed`);
            console.log(err)

        });
}
function checkout(Task, sizeId, proxyUrl) {
    console.log(cookieJar);

    for (var i = stopTask.length -1; i >= 0; i--) {
        if (stopTask[i] == Task.Id) {
            let removed = stopTask.splice(i, 1);
            ipc.send('task-stoppedB', Task);
            return false;
        }
    }

    let profiles = JSON.parse(localStorage.getItem("billingProfiles"));
    let Profile = findObjectByKey(profiles, "Name", Task.Profile);

    let header = {
        'authority': 'www.supremenewyork.com',
        'scheme': 'https',
        "accept": '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'www.supremenewyork.com',
        //iphone userAgent below
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'
        //'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19'
    }
    if (captcha_tokens.length > 0){

        let formData = {
            //not sure if the 1 should be a number or a string
            //'is_from_android': 1,
            //'utf8': '✓',
            'MIME Type': 'application/x-www-form-urlencoded',
            'store_credit_id':'',
            'from_mobile': 1,
            'cookie-sub': encodeURIComponent(JSON.stringify({sizeId:1})), 
            'same_as_billing_address': 1, 
            //'scerkhaj': CKCRSUJHXH
            'order[billing_name]': Profile.FullName,
            'order[email]': Profile.Email,
            'order[tel]': Profile.Phone,
            'order[billing_address]': Profile.Address,
            'order[billing_address_2]': Profile.Apt,
            'order[billing_zip]': Profile.Zip,
            'order[billing_city]': Profile.City,
            'order[billing_state]': Profile.State,
            'order[billing_country]': Profile.Country,
            'store_address': 1,
            'riearmxa': Profile.Card, 
            'credit_card[month]': Profile.Month,
            'credit_card[year]': Profile.Year,
            'rand': 'Visa',
            //Profile.CardType,
            'credit_card[meknk]': Profile.Cvv,
            'order[terms]': 0,
            'order[terms]': 1,
            'g-recaptcha-response': captcha_tokens[0]
        }
        captcha_tokens.splice(0, 1);
        //usses the first available token then removes it, creating a cycle.
        let Checkout = {
            method: 'POST',
            uri: 'https://www.supremenewyork.com/checkout.json',
            headers: header,
            form: formData,
            proxy: proxyUrl,
            json: true,
            resolveWithFullResponse: true,
            jar: cookieJar
        }
        setTimeout(function () {
            rp(Checkout).then((response) => {
                ipc.send('submiting-infoB', Task);
                if (response.statusCode == 200) {
                    console.log(response);
                    console.log(response.body.status);
                    if (response.body.status == "failed") {
                        ipc.send('invalid-infoB', Task);
                    } else {
                        checkStatus(Task, response, sizeId, proxyUrl);
                    }
                } else {
                    ipc.send('checkout-failedB', Task);
                    setTimeout(function () {
                        ipc.send('retryingB', Task);
                        checkout(Task, sizeId, proxyUrl);
                    }, bTask.Error);
                }
                    
            })
            .catch((err) => {
                
                ipc.send('checkout-failedB', Task);
                setTimeout(function () {
                    ipc.send('retryingB', Task);
                    checkout(Task, sizeId, proxyUrl);
                }, bTask.Error);
                

                console.log(`ERROR: get color URL request failed`);
                console.log(err)

            });
        }, Task.Delay);

    } else {
        for (var i = stopTask.length -1; i >= 0; i--) {
            if (stopTask[i] == Task.Id) {
                console.log('stopping in captcha loop');
                //let removed = stopTask.splice(i, 1);
                //console.log(removed);
                ipc.send('task-stoppedB', Task);
                return false;
            }
        }
        ipc.send('waitingCaptchaB', Task);
        setTimeout(function () {
            checkout(Task, sizeId, proxyUrl);
        }, 1000);
    }
}
function checkStatus(Task, response, sizeId, proxyUrl) {

    for (var i = stopTask.length -1; i >= 0; i--) {
        if (stopTask[i] == Task.Id) {
            let removed = stopTask.splice(i, 1);
            ipc.send('task-stoppedB', Task);
            return false;
        }
    }

    let header = {
        'authority': 'www.supremenewyork.com',
        'scheme': 'https',
        "accept": '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
        //'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'www.supremenewyork.com',
        //iphone userAgent below
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'
    }
    let formData = {
        
    }

    let checkStatus = {
        method: 'POST',
        uri: `https://www.supremenewyork.com/checkout/${response.slug}/status.json`,
        headers: header,
        form: formData,
        json: true,
        proxy: proxyUrl,
        resolveWithFullResponse: true,
        jar: cookieJar
    }

    rp(checkStatus)
        .then(function (response) {
            if (response.statusCode == 200) {
                console.log(response);
                console.log(response.status);
                if (response.status != "failed") {
                    ipc.send('check-emailB', Task);
                } else {
                    ipc.send('checkout-failedB', Task);
                    setTimeout(function () {
                        ipc.send('retryingB', Task);
                        checkout(Task, sizeId, proxyUrl);
                    }, bTask.Error);
                }
            } else {
                ipc.send('checkout-failedB', Task);
                setTimeout(function () {
                    ipc.send('retryingB', Task);
                    checkout(Task, sizeId, proxyUrl);
                }, bTask.Error);
            }
            
        })
        .catch(function (err) {

            console.log(`ERROR: get color URL request failed`);
            console.log(err)

        });
}

