// ----------All global variables ----------
var _current_page = 1;
var _home_folder_path = "/home";
var _current_folder_path = "/home";
var _current_folder_id = "0";
var _previous_folder_path = "/home";
var _last_requested_folder_response = {};
var _last_requested_file_response = {};
var _content_sort_method = "default";
var _currentUploadType = 'none';
var _currentUploadFolder ='/';
var _currentUploadsNewFolderList = [];
var _currentUploadedFolderList = new Map();
var _currentUploadsCounter = -1;
var _consicutiveUploadsCounter = 10;
var _currentUploadsCallbackCounter = 0;
var _totalUploadedFiles = 0;
var _totalUploadableFiles = 0;
var _currentUploadingFOlderPath = '';
var _currentUploadingFileName = '';
var _checkForDuplicateUpload = false;
var _checkDupCompleteCounter = 0;
var _uploadFaildWithError = false;
var _a = "DEMOKEY";
var _isToastActive = false;
var _globalUPjaxB = {
    abort: function (e) {
        console.log("Nothing to abort");
    }
}
var _globalUPjax = _globalUPjaxB;
var _lastUpTime = 0, _uploaded = 0;
function _getToken() { for (var c = "", d = 0; c += String.fromCharCode(Math.floor(91 * Math.random()) + 33), d < 7; d++); var e = a(c, _a); return c + " " + e } function a(e, f) { var d, i, g, c = 0, h = ""; if (0 == e.length) return c; for (d = 0, g = e.length; d < g; d++)c = (c << 5) - c + e.charCodeAt(d) ^ f.charCodeAt(d % f.length), c |= 0, h += c.toString(16); return b(h, f) } function b(d, e, g, c) { var f = ""; for (c = d.length - 1; c >= 0; c--)f += ((d.charCodeAt(c) + d.charCodeAt(g - c - 1) | 0) ^ e.charCodeAt(c % e.length)).toString(16); return f }