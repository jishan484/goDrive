$.ajaxSetup({
    headers: { 'xauthtoken': _getToken() }
});

function request(path, datas, method, token, callback) {
    $('#udprogress')[0].style.display = 'block';
    $.ajax({
        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            //Upload progress and event handling
            xhr.upload.addEventListener("progress", progressHandler, false);
            xhr.addEventListener("load", completeHandler, false);
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
    if(isToastActive) return;
    isToastActive = true;
    $('#errorToast .me-auto').html(type);
    $('#errorToast .toast-body').html(msg);
    $('#errorToast').toggleClass('show');
    setTimeout(function () {
        $('#errorToast').toggleClass('show');
        isToastActive = false;
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

$('#createFolderBtn').click(function () {
    var folderName = $('#foldername').val();
    if (folderName == null || folderName == '') {
        $('#folderCreateError').html('Folder name cannot be empty');
    }
    else {
        var payload = { 
            folderName: folderName,
            folderPath: _current_folder,
            action: 'createFolder'
        };
        request("app/u/folder", payload, 'POST',_getToken(), (data) => {
            if(data.status == 'success'){
                $('#folderCreateError').html('Folder created successfully');
                $('#createFolderBtn').attr('disabled', true);
                setTimeout(() => {
                    $('#collapseCreate').toggleClass('show');
                    $('#createFolderBtn').attr('disabled', false);
                    $('#folderCreateError').html('');
                    $('#foldername').val('');
                }, 3000);
            }
            else{
                $('#folderCreateError').html(data.error);
            }
        }
        );
    }
});