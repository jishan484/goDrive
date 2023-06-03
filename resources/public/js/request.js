$.ajaxSetup({
    beforeSend: function (xhr) {
        xhr.setRequestHeader('xauthtoken', _getToken());
    }
});

window.addEventListener('online', () => _systemOnlineStatus = true);
window.addEventListener('offline', () => _systemOnlineStatus = false);

function request(path, datas, method, callback,backgroundFetch=true) {
    if(backgroundFetch) $('#udprogress')[0].style.display = 'block';
    $.ajax({
        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            //Upload progress and event handling
            xhr.upload.addEventListener("progress", progressHandler, false);
            if(backgroundFetch){
                xhr.addEventListener("load", completeHandler, false);
            }
            xhr.addEventListener("error", errorHandler, false);
            xhr.addEventListener("abort", abortHandler, false);
            return xhr;
        },
        url: path,
        type: method,
        data: datas,
        success: (data, text) => {
            callback(data);
        },
        error: (request, status, error) => {
            processError(request, error);
            completeHandler(null);
            callback(false);
        }
    });
}

function upload(file,path,callback,tracker,showProgress=true,checkDuplicate=false) {
    if(path == undefined || path == '' || path == null)
    _uploaded = 0;
    _lastUpTime = (new Date()).getTime();
    _globalUPjax = $.ajax({
        xhr: function () {
            var xhr = new window.XMLHttpRequest(2);
            //Upload progress and event handling
            if (showProgress)
                xhr.upload.addEventListener("progress", uploadProgressHandler, false);
            xhr.addEventListener("load", completeHandler, false);
            xhr.addEventListener("abort", abortHandler, false);
            return xhr;
        }
        ,
        url: 'app/u/file',
        type: 'POST',
        data: file,
        mimeType: 'multipart/form-data',
        cache: false,
        headers: { 'm-filename': file.name, 'm-filepath': path,'m-mimetype': file.type,'m-chkdup':checkDuplicate },
        contentType: false,
        processData: false,
        success: (data, text) => {
            if (onSuccessUpload != undefined && onSuccessUpload != null)
                onSuccessUpload(file,data);
            try{
                data = JSON.parse(data);
            } catch(e){
                data = {status:'error',error:data};
            }
            callback(true, data, tracker);
        },
        error: (request, status, error) => {
            processError(request, 0);
            completeHandler(null);
            if (request.responseText != undefined && request.responseText != null){
                let data = null;
                try{
                    data = JSON.parse(request.responseText);
                    callback(true, data, tracker);
                } catch(e){
                    callback(false, request, tracker);
                }
            } else {
                callback(false, request, tracker);
            }
        }
    });
    // _globalUPjaxB = _globalUPjax;
}

function progressHandler(e) {
    if (e.lengthComputable) {
        // Append progress percentage.
        var loaded = e.loaded;
        var total = e.total;
        var progressValue = Math.round((loaded / total) * 100);
        $('#reqProgress')[0].style.width = progressValue + '%';
    }
}
function uploadProgressHandler(e) {
    if (e.lengthComputable) {
        // Append progress percentage.
        let loaded = e.loaded;
        let total = e.total;
        let progressValue = Math.round((loaded / total) * 100);
        let speed = showspeed(loaded);
        let remaining = (total - loaded) / speed;
        // seconds to minutes seconds
        let remainingTime = Math.floor(remaining / 60) + 'Min ' + Math.floor(remaining % 60)+'Sec';

        $('#uploadProgress')[0].style.width = progressValue + '%';
        $('#UPspeed').html(formatBytes(speed, 2) + '/s');
        $('#UPusize').html(formatBytes(loaded, 3));
        $('#UPtime').html((remainingTime =='NaNMin NaNSec' ? '0Min 0Sec' : remainingTime));
    }
}
function completeHandler(event) {
    $('#reqProgress')[0].style.width = '100%';
    setTimeout(function () {
        $('#reqProgress')[0].style.width = '10%';
        $('#udprogress')[0].style.display = 'none';
    },600);
}
function errorHandler(event) {
    errorToast('Network Error', 'It seems you are currently ofline! Please check your network.');
}
function abortHandler(event) {
    errorToast('Upload Aborted', 'Upload has been aborted.');
}

function processError(request , code){
    switch (request.status) {
        case 0:
            if(code != 0)
                errorToast('Request Aborted', 'Request has been aborted.');
            if (_systemOnlineStatus == true)
                errorToast('Request Failed', 'File could not be uploaded.');
            else errorToast('Network Error', 'It seems you are currently ofline!<br>Please check your network.');
            break;
        case 401:
            errorToast('Unauthorized', 'You are not authorized to perform this action.');
            break;
        case 403:
            errorToast('Forbidden', 'You are not authorized or<br>your session has expired. Redirecting to login page in 5 seconds.');
            setTimeout(function () {
                window.location.reload();
            }, 5000);
            break;
        case 404:
            errorToast('Not Found', 'The requested resource was not found. Please check the URL and try again.');
            break;
        case 500:
            errorToast('Internal Server Error', 'Something went wrong on the server. Please try again later.');
            break;
        case 503:
            errorToast('Service Unavailable', 'The server is currently unable to handle the request!');
            break;
        case 507:
            break;
        case 502:
            break;
        case 504:
            errorToast('Gateway Timeout', 'The server is currently unable to handle the request!');
            break;
        default:
            errorToast('Network Error', 'It seems you are currently ofline! Please check your network.');
            break;
    }
}

function errorToast(type , msg)
{
    if(_isToastActive) return;
    _isToastActive = true;
    $('#errorToast .me-auto').html(type);
    $('#errorToast .toast-body').html(msg);
    $('#errorToast').addClass('show');
    setTimeout(function () {
        $('#errorToast').removeClass('show');
        _isToastActive = false;
    }, 5000);
    $('#udprogress')[0].style.display = 'none';
}

function successToast(msg) {
    $('#successToastText').html(msg);
    $('#successToast').addClass('show');
    setTimeout(function () {
        $('#successToast').removeClass('show');
    }, 2000);
}

// calculation functions

function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Bytes';
    var k = 1024,
        dm = decimals <= 0 ? 0 : decimals || 2,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


function showspeed(loaded) {
    var endTime = (new Date()).getTime();
    upSpeed = ((loaded - _uploaded) * 1000) / ((endTime - _lastUpTime));
    _uploaded = loaded;
    _lastUpTime = endTime;
    if (upSpeed < 0.1) upSpeed = 0;
    return upSpeed;
}


//============================================ App use cases ============================================================



// :CREATE:FOLDER:
$('#createFolderBtn').click(function () {
    var folderName = $('#foldername').val();
    if (folderName == null || folderName == '') {
        $('#folderCreateError').html('Folder name cannot be empty');
    }
    else if (!folderName.match(/^[a-zA-Z0-9_.]+.+/)) {
        $('#folderCreateError').html('Folder name cannot start with special characters');
    }
    else if (folderName.match(/[^a-zA-Z0-9-_\\+\\. \\(){}"':\[\]]/)) {
        $('#folderCreateError').html('Folder name contains invalid characters');
    }
    else if(folderName.match(/^[._]+$/)){
        $('#folderCreateError').html('Folder name Must contain atleast one letter or number');
    } // /^[_.]*[a-zA-Z0-9]+[a-zA-Z0-9-_\\+\\.\\(){}"':\[\]]*$/
    else {
        $('#createFolderBtn').attr('disabled', true);
        var payload = { 
            folderName: folderName,
            folderPath: _current_folder_path
        };
        request("app/u/folder", payload, 'POST', (response) => {
            if(response == false){
                $('#folderCreateError').html("Some error occured!");
                $('#createFolderBtn').attr('disabled', false);
            }
            if(response.status == 'success'){
                $('#folderCreateError').html('Folder created successfully');
                $('#createFolderBtn').attr('disabled', true);
                loadFolders('');
                setTimeout(() => {
                    $('#collapseCreate').toggleClass('show');
                    $('#createFolderBtn').attr('disabled', false);
                    $('#folderCreateError').html('');
                    $('#foldername').val('');
                }, 3000);
            }
            else{
                $('#folderCreateError').html(response.error);
                $('#createFolderBtn').attr('disabled', false);
            }
        }
        );
    }
});


// :FETCH:FOLDER:
function fetchFolder(folderName,callback,opt) {
    var payload = {
        folderPath: (folderName != '')?_current_folder_path+"/"+folderName:_current_folder_path,
        folderName: folderName
    };
    request("app/u/folder", payload, 'GET', (response) => {
        if(response.status == 'success'){
            if(response.data.fullPath != undefined){
                _current_folder_path = response.data.fullPath;
                _previous_folder_path = response.data.folderPath;
                _current_folder_id = response.data.id;
                _current_folder_name = response.data.folderName;
            }
            _last_requested_folder_response = response.data;
            callback(response.data.subFolders);
        }
    },opt
    );
}

// :DELETE:FOLDER:
function removeFolder(folderName,callback) {
    var payload = {
        folderPath: _current_folder_path,
        folderName: folderName
    };
    request("app/u/folder", payload, 'DELETE', (response) => {
        if(response.status == 'success'){
            callback(true);
        }
    });
}

// :UPDATE:FOLDER:
function updateFolder(type,data,folderId,folderName,callback){
    let payload = {}; payload.updates = {};

    payload.folderPath = _current_folder_path;
    payload.folderName = folderName;
    payload.folderId = folderId;

    if(type == 'name'){
        payload.updates.folderName = data;
        if (payload.updates.folderName == null || payload.updates.folderName == '') {
            callback(false,{error:'Folder name cannot be empty'}); return;
        }
        else if (!payload.updates.folderName.match(/^[a-zA-Z0-9_.]+.+/)) {
            callback(false,{error:'Folder name cannot start with special characters'}); return;
        }
        else if (payload.updates.folderName.match(/[^a-zA-Z0-9-_\\+\\. \\(){}"':\[\]]/)) {
            callback(false,{error:'Folder name contains invalid characters'}); return;
        }
        else if (payload.updates.folderName.match(/^[._]+$/)) {
            callback(false,{error:'Folder name Must contain atleast one letter or number'}); return;
        }
    } else if(type == 'location'){
        payload.updates.folderPath = _current_folder_path;
        payload.updates.folderId = _current_folder_id;
        payload.folderPath = data.path;
        payload.folderId = data.id;
        payload.folderName = data.name;
    } else{ callback(false,'Not a valid update type'); return; }

    request('/app/u/folder',payload,'PATCH',(response)=>{
        callback(response);
    });
}

function fetchFiles(folderName, callback, opt) {
    var payload = {
        filePath: _current_folder_path,
        folderName: folderName
    };
    request("app/u/file", payload, 'GET', (response) => {
        if (response.status == 'success') {
            _last_requested_file_response = response.data;
            callback(response.data);
        }
    }, opt
    );
}

function deleteFile(fileId, callback, opt) {
    var payload = {
        filePath: _current_folder_path,
        fileId: fileId
    };
    request("app/u/file", payload, 'DELETE', (response) => {
        if (response.status == 'success') {
            callback();
        } else errorToast('Request Aborted', 'Error occured while deleting file');
    }, opt
    );
}

// :UPDATE:FILE:
function updateFile(type, update, fileId, fileName, callback) {

    let payload = {}; payload.updates = {};

    payload.filePath = _current_folder_path;
    payload.fileName = fileName;
    payload.fileId = fileId;

    if (type == 'name') {
        payload.updates.fileName = update;
        if (payload.updates.fileName == null || payload.updates.fileName == '') {
            callback(false, { error: 'File name cannot be empty' }); return;
        }
    } else if (type == 'location') {
        payload.updates.filePath = _current_folder_path;
        payload.updates.parentFolderId = _current_folder_id;
        payload.fileId = update.id;
        payload.filePath = update.path;
        payload.fileName = update.name;
    } else { callback(false, 'Not a valid update type'); return; }

    request('/app/u/file', payload, 'PATCH', (response) => {
        callback(response);
    });
}

function createFolderDuringUpload(path,newDirsName,callback,showProgress){
    var payload = {
        foldersFullPath: newDirsName,
        folderPath: path,
        folderType: 'list',
        multiple: true,
        force: true
    };
    request("app/u/folder", payload, 'POST', (response) => {
        callback(response);
    },showProgress);
}

// :STATUS:STORAGE:
function getStorageStatus(callback) {
    request("app/u/status/storage", {}, 'GET', (response) => {
        if (response.status == 'success') {
            callback(response.data);
        }
    });
}
