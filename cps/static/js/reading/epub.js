/* global $, calibre, EPUBJS, ePubReader */

var reader;

(function() {
    "use strict";

    EPUBJS.filePath = calibre.filePath;
    EPUBJS.cssPath = calibre.cssPath;

    reader = ePubReader(calibre.bookUrl, {
        restore: true,
        bookmarks: calibre.bookmark ? [calibre.bookmark] : []
    });

    Object.keys(themes).forEach(function (theme) {
        reader.rendition.themes.register(theme, themes[theme].css_path);
    });

    if (calibre.useBookmarks) {
        reader.on("reader:bookmarked", updateBookmark.bind(reader, "add"));
        reader.on("reader:unbookmarked", updateBookmark.bind(reader, "remove"));
    } else {
        $("#bookmark, #show-Bookmarks").remove();
    }
/*
    const isWeChat = navigator.userAgent.toLowerCase().indexOf('micromessenger') != -1;
    const isAndroid = navigator.userAgent.toLowerCase().indexOf('android') != -1;
    var touchStart = 0;
    var touchEnd = 0;
    if (isWeChat && isAndroid) {
        reader.rendition.on('mousedown', function (event) {
            touchStart = event.screenX || event.changedTouches[0].screenX;
        });
        reader.rendition.on('mouseup', function (event) {
            touchEnd = event.screenX || event.changedTouches[0].screenX;
            if (touchStart < touchEnd) {
                reader.rendition.prev();
            }
            if (touchStart > touchEnd) {
                reader.rendition.next();
            }
        });
    } else {
        reader.rendition.on('touchstart', function (event) {
            touchStart = event.screenX || event.changedTouches[0].screenX;
        });
        reader.rendition.on('touchend', function (event) {
            touchEnd = event.screenX || event.changedTouches[0].screenX;
            if (touchStart < touchEnd) {
                reader.rendition.prev();
            }
            if (touchStart > touchEnd) {
                reader.rendition.next();
            }
        });
    }
*/
    /**
     * @param {string} action - Add or remove bookmark
     * @param {string|int} location - Location or zero
     */
    function updateBookmark(action, location) {
        // Remove other bookmarks (there can only be one)
        if (action === "add") {
            this.settings.bookmarks.filter(function (bookmark) {
                return bookmark && bookmark !== location;
            }).map(function (bookmark) {
                this.removeBookmark(bookmark);
            }.bind(this));
        }
        
        var csrftoken = $("input[name='csrf_token']").val();

        // Save to database
        $.ajax(calibre.bookmarkUrl, {
            method: "post",
            data: { bookmark: location || "" },
            headers: { "X-CSRFToken": csrftoken }
        }).fail(function (xhr, status, error) {
            alert(error);
        });
    }
    
    // Default settings load
    const theme = localStorage.getItem("calibre.reader.theme") ?? "lightTheme";
    selectTheme(theme);
})();
