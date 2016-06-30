var suggestions = [];// collecct all the bookmarks stored in browser
var selectedLinks;//collect all the filtered links
chrome.runtime.onInstalled.addListener(function() {
    /*on time of installation it will collect all the bookmarks
      and store the links in suggestions.
    */
    getAllBookmarks();
});


chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  filterLinks(text, suggest)
})

chrome.omnibox.onInputEntered.addListener(function(text, suggest) {
  changeTabs(text, suggest);
});

chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
    getAllBookmarks();
});

chrome.bookmarks.onRemoved.addListener(function(id, removeInfo) {
    getAllBookmarks();
});

chrome.bookmarks.onChanged.addListener(function(id, changeInfo) {
    getAllBookmarks();
});

function getAllBookmarks(){
  suggestions = [];
  chrome.bookmarks.getTree(function(value) {
        value.forEach(function(val) {
            var bookmarkArray = value[0].children
            bookmarkArray.forEach(function(links) {
                var bLinks = links.children;
                bLinks.forEach(function(blink) {

                    var title = blink.title;
                    var url = blink.url;

                    if (!url) {
                        var customBMark = blink.children;
                        customBMark.forEach(function(urls) {
                            var title = urls.title;
                            var url = urls.url;
                            if (url) {
                                suggestions.push({ content: url, description: title });
                            }
                        });
                    } else {
                        suggestions.push({ content: url, description: title });
                    }
                });
            });
        });
    });
}

function changeTabs(text, suggest){
  if (selectedLinks.length>0) {
        // change the url based of current tab based on selected array of bookmarks
        chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
            chrome.tabs.update(tab.id, { url: selectedLinks[0].content });
        });
    } else {
        // search the element on google if there is no link found from bookmarks
        chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
            if (text.indexOf(' ') >= 0) {
                text = text.replace(' ','+')
            }
            chrome.tabs.update(tab.id, { url: "https://www.google.co.in/#q=" + text });
        });
    }
}

function filterLinks(text, suggest){
  search(text, suggestions)
    /* this function will return an array of object based on key passed from object passed in it */
    function search(s, arr) {
        var matches = [];
        var regexp = new RegExp(s, 'gi');
        for (var i = arr.length; i--;) {
            for (key in arr[i]) {
                if (arr[i].hasOwnProperty(key) && arr[i][key].match(regexp))
                    matches.push(arr[i]);
                continue;
            }
        }
        return matches;
    };
    selectedLinks = search(text, suggestions);
    // returns the sugestions on url from bookmarks
    suggest(search(text, suggestions));
}