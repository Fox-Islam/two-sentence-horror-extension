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
	var timeframe = result.timeframe;
	var loaderElement = document.getElementById('loader');
	var contentContainerElement = document.getElementById('content-container');
	var contentTitleElement = document.getElementById('content-title');
	var contentBodyElement = document.getElementById('content-body');
	var contentImageElement = document.getElementById('content-image');
	var contentLinkElement = document.getElementById('content-link');
	var contentRefreshButtonElement = document.getElementById('refresh-button');
	var timeframeSelectElement = document.getElementById('timeframe-select');
	timeframeSelectElement.value = timeframe;

	function getTopHorror() {
		let subreddit = 'TwoSentenceHorror';
		let criteria = 'top';
		let url = 'https://www.reddit.com/r/' + subreddit + '/' + criteria + '/.json?raw_json=1&limit=1&t=' + timeframe;
		let xhr = createRequest('GET', url);

		xhr.onload = function() {
			let jsonResponse = JSON.parse(xhr.responseText);
			let contentData = getContentData(jsonResponse);
			stopLoading();
			setContent(contentData);
		};

		xhr.onerror = function() {
			let contentData = {
				title: 'Could not fetch a horror (spooky!)',
				selftext: 'An error has occured',
				url: ''
			};
			stopLoading();
			setContent(contentData);
		};

		startLoading();
		xhr.send();
	}

	function createRequest(method, url) {
		var xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) {
			xhr.open(method, url, true);
		} else {
			xhr = null;
		}
		return xhr;
	}

	function startLoading() {
		loaderElement.classList = ['visible'];
		contentContainerElement.classList = [];
	}

	function stopLoading() {
		contentContainerElement.classList = ['visible'];
		loaderElement.classList = [];
	}

	function getContentData(jsonResponse) {
		if (jsonResponse && jsonResponse.data && jsonResponse.data.children && jsonResponse.data.children[0] && jsonResponse.data.children[0].data) {
			return jsonResponse.data.children[0].data;
		}
		return {
			title: '',
			selftext: '',
			url: ''
		};
	}

	function setContent(contentData) {
		setTitle(contentData);
		setBody(contentData);
		setImage(contentData);
		setPermalink(contentData);
	}

	function setTitle(contentData) {
		contentTitleElement.innerText = contentData.title;
	}

	function setBody(contentData) {
		if (!contentData.selftext_html) {
			contentBodyElement.innerText = contentData.selftext;
			return;
		}
		contentBodyElement.innerHTML = contentData.selftext_html;
	}

	function setImage(contentData) {
		if (contentData.post_hint === 'image') {
			contentImageElement.src = contentData.url;
			contentImageElement.classList = ["visible"];
			return;
		}
		contentImageElement.src = "";
		contentImageElement.classList = [];
	}

	function setPermalink(contentData) {
		if (contentData.permalink) {
			contentLinkElement.href = 'http://www.reddit.com' + contentData.permalink;
			contentLinkElement.innerText = 'Link';
			return;
		}
		contentLinkElement.href = '';
		contentLinkElement.innerText = '';
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
