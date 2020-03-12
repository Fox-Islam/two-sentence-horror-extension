if (!hasAccessToChromeStorage()) {
	var localStorageEmulation = {
		timeframe: 'hour'
	}
	var chrome = {
		storage: {
			sync: {
				get: function (storageArray, callback) {
					var result = {};
					storageArray.forEach(storedKey => {
						result[storedKey] = localStorageEmulation[storedKey]
					});
					callback(result);
				},
				set: function (storageObject, callback) {
					localStorageEmulation = storageObject;
					callback();
				}
			}
		}
	}
}

function hasAccessToChromeStorage() {
	return chrome && chrome.storage && chrome.storage.sync;
}

chrome.storage.sync.get(['timeframe'], function (result) {
	let timeframe = result.timeframe;
	var contentTitleElement = document.getElementById('content-title');
	var contentBodyElement = document.getElementById('content-body');
	var contentLinkElement = document.getElementById('content-link');
	var contentRefreshButtonElement = document.getElementById('refresh-button');
	var timeframeSelectElement = document.getElementById('timeframe-select');
	timeframeSelectElement.value = timeframe;

	function createRequest(method, url) {
		var xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) {
			xhr.open(method, url, true);
		} else {
			xhr = null;
		}
		return xhr;
	}

	function getTopHorror() {
		let url = 'https://www.reddit.com/r/TwoSentenceHorror/top/.json?raw_json=1&limit=1&t=' + timeframe;
		let xhr = createRequest('GET', url);

		if (!xhr) {
			throw new Error('CORS not supported');
		}

		xhr.onload = function() {
			jsonResponse = JSON.parse(xhr.responseText);
			let contentData = jsonResponse.data.children[0].data;
			let permalink = 'http://www.reddit.com' + contentData.permalink
			contentTitleElement.innerText = contentData.title;
			contentBodyElement.innerText = contentData.selftext;
			contentLinkElement.href = permalink;
			contentLinkElement.innerText = 'Link';
		};

		xhr.onerror = function() {
			console.log('Could not fetch a horror (spooky!)');
		};

		xhr.send();
	}

	contentRefreshButtonElement.addEventListener('click', function () {
		getTopHorror();
	});

	timeframeSelectElement.addEventListener('change', function () {
		timeframe = this.value;
		saveChanges();
	});

	function saveChanges () {
		chrome.storage.sync.set({'timeframe': timeframe}, function () {
			//
		});
	}

	getTopHorror();
})
