chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({timeframe: 'day'});
});
