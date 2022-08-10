$.ajaxSetup({
    headers: { 'xauthtoken': _getToken() }
});

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
function progressHandler(e) {
    if (e.lengthComputable) {
        // Append progress percentage.
        var loaded = e.loaded;
        var total = e.total;
        var progressValue = Math.round((loaded / total) * 100);
        $('#reqProgress')[0].style.width = progressValue + '%';
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

function processError(request , error){
    // is request is not an object, then it is a string
    // if(typeof error !== 'object'){
    //     error = request;
    // }
    // console.log(error);
    switch (request.status) {
        case 0:
            errorToast('Network Error', 'It seems you are currently ofline! Please check your network.');
            break;
        case 401:
            errorToast('Unauthorized', 'You are not authorized to perform this action.');
            break;
        case 403:
            errorToast('Forbidden', 'You are not authorized or<br>your session has expired. Redirecting to login page in 5 seconds.');
            setTimeout(function () {
                window.location.href = '/';
            }, 5000);
            break;
        case 404:
            errorToast('Not Found', 'The requested resource was not found. Please check the URL and try again.');
            break;
        case 500:
            errorToast('Internal Server Error', 'Something went wrong on the server. Please try again later.');
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
    $('#errorToast').toggleClass('show');
    setTimeout(function () {
        $('#errorToast').toggleClass('show');
        _isToastActive = false;
    }, 5000);
    $('#udprogress')[0].style.display = 'none';
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

var lastUpTime = 0, uploaded = 0;
function showspeed(loaded) {
    var endTime = (new Date()).getTime();
    upSpeed = ((loaded - uploaded) * 1000) / ((endTime - lastUpTime));
    uploaded = loaded;
    lastUpTime = endTime;
    if (upSpeed < 0.1) upSpeed = 0;
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