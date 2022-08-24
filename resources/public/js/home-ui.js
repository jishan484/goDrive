function renderFolders(folders) {
    var html = `<div class="col-lg-12 col-md-12 order-1">
                    <div class="row">`;
    sortFolders(folders);
    for (var i = 0; i < folders.length; i++) {
        html += `<div class="col-lg-3 col-md-4 col-6 mb-3">
                   <div class="card">
                        <div class="card-body folder" id="${folders[i].folderId}" oncontextmenu="folderOptions(this,event);return false;" ondblclick="folderOpen('${folders[i].folderName}')">
                            <div class="card-title d-flex align-items-start justify-content-between pointable">
                                <div class="avatar flex-shrink-1">
                                    <img src="image/folder_ftp.png" alt="chart success" style="width:50px;height:50px;" />
                                </div>
                                <div class="dropdown" ondblclick="stopdblClick(event);return false;">
                                    <button class="btn p-0" type="button" id="cardOpt3"
                                        data-bs-toggle="dropdown" aria-haspopup="true"
                                        aria-expanded="false">
                                        <i class="bx bx-dots-vertical-rounded"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-end">
                                        <a class="dropdown-item" href="javascript:void(0);">Star</a>
                                        <a class="dropdown-item" href="javascript:void(0);">Lock</a>
                                    </div>
                                </div>
                                <ul class="dropdown-menu folderOption" data-popper-placement="bottom-start">
                                    <li><div class="dropdown-item" onclick="folderOpen('${folders[i].folderName}')">Open</div></li>
                                    <li><div class="dropdown-item" onclick="folderOpen('${folders[i].folderName}')">Share</div></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><div class="dropdown-item" onclick="folderRenme('${folders[i].folderId}')">Rename</div></li>
                                    <li><div class="dropdown-item" onclick="folderCopyMove('${folders[i].folderId}')">Move</div></li>
                                    <li><div class="dropdown-item" onclick="folderDelete('${folders[i].folderName}')">Delete</div></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><div class="dropdown-item" onclick="folderUpdatePermission('${folders[i].folderId}')">Update permissions</div></li>
                                </ul>
                            </div>
                            <div class="small folder-name">${folders[i].folderName}</div>
                            <div class="folder-name-s">${folders[i].createdOn}</div>
                        </div>
                    </div>
                </div>`
    }
    html += `</div> </div>`;

    $('#folders').html(html);
}


function renderFiles(files) {
    let html = '<div class="row mb-3">';
    sortFiles(files);
    for (let i = 0; i < files.length; i++) {
        html+=`<div class="col-lg-3 col-md-4 col-6 mb-3">
           <div class="card">
               <div class="card-body folder">
                   <div class="card-title d-flex align-items-start justify-content-between pointable">
                       <div class="avatar flex-shrink-1">
                           <img src="image/format/xlsx.svg" alt="chart success" style="width: 50px; height: 50px;" />
                       </div>
                       <div class="dropdown">
                           <button class="btn p-0" type="button" id="cardOpt3" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                               <i class="bx bx-dots-vertical-rounded"></i>
                           </button>
                           <div class="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                               <a class="dropdown-item" href="javascript:void(0);">Star</a>
                               <a class="dropdown-item" href="javascript:void(0);">Lock</a>
                           </div>
                       </div>
                   </div>
                   <div class="small file-name">${files[i].fileName}</div>
                   <div class="file-name-s"><span>${files[i].modifiedOn}</span> <span>${formatBytes(files[i].fileSize,2)}</span></div>
                   <div class="file-name-s"></div>
               </div>
           </div>
       </div>`;
    }
    html += '</div>';
    $('#files').html(html);
}



function renderTableFiles(files) {
    if(files.length == 0) {setTimeout(()=>{$('#fileList').html('')},2000); return;}
    let html = `<div class="table-responsive text-nowrap mh-px-150 mb-2" style="z-index: 2000;">
                    <table class="table table-sm table-bordered table-hover table-custom">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>`;
    for (let i = 0; i < files.length; i++) {
        html += `<tr>
                    <td>${files[i].name}</td>
                    <td>${formatBytes(files[i].size,2)}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="removeFile(${i})">Remove</button></td>
                </tr>`;
    }
    html += `</tbody>
                </table>
            </div>`;
    $('#fileList').html(html);

}


function renderUploadProgress()
{
    let html =
    `<div class="row mb-1">
        <div class="col-md-12">
            <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%" id="uploadProgress"></div>
            </div>
        </div>
    </div>
    <div class="row align-left">
        <div class="col-md-12 col-lg-12 col-sm-12">
            <span>File Name: </span><span id="UPname">f.txt</span>
        </div>
        <div class="col-md-6 col-lg-6 col-sm-6">
            <span>Speed: </span><span id="UPspeed">20 Kbps</span>
        </div>
        <div class="col-md-6 col-lg-6 col-sm-6">
            <span>File Size: </span><span id="UPtsize">20 MB</span>
        </div>
        <div class="col-md-6 col-lg-6 col-sm-6">
            <span>Remain Time: </span><span id="UPtime">2min 30sec</span>
        </div>
        <div class="col-md-6 col-lg-6 col-sm-6">
            <span>Uploaded: </span><span id="UPusize">12 MB</span>
        </div>
        <div class="col-md-6 col-lg-6 col-sm-6">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="_globalUPjax.abort();"> Cancle this Upload </button> 
        </div>
    </div>`;
    $('#fileList').html(html);
}






//-------------for home-main.js------------------
function folderOptions(elem,event) {
    event.preventDefault();
    event.stopPropagation();
    var folderId = elem.id;
    if ($(elem).find('.folderOption').hasClass('show')) return false;
    $(document).off('click');
    $('.folderBodyOption').removeClass('show');
    $('#' + folderId +' .folderOption').toggleClass('show');
    $('.folderOption').not($('#' + folderId +' .folderOption')).removeClass('show');
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.folderOption').length) {
            $('.folderOption').removeClass('show');
            $(document).off('click');
        }
    });
    return false;
}

function folderBodyOptions(elem,event) {
    $('#bodyOptions .folderBodyOption').addClass('show');
    // update folder body options position relative to the clicked element
    let folderBodyOption = $('#bodyOptions .folderBodyOption');
    let folderBodyOptionWidth = folderBodyOption.width();
    let folderBodyOptionHeight = folderBodyOption.height();
    let folderBodyOptionTop = event.pageY - (folderBodyOptionHeight* 0.5);
    let folderBodyOptionLeft = event.pageX - (folderBodyOptionWidth *0.75);
    folderBodyOption.css({
        top: folderBodyOptionTop,
        left: folderBodyOptionLeft
    });
    $('.folderOption').removeClass('show');
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.folderBodyOption').length) {
            $('.folderBodyOption').removeClass('show');
            $(document).off('click');
        }
    });
    event.preventDefault();
    event.stopPropagation();
    return false;
}

function stopdblClick(e) {
    e.stopPropagation();
    return false;
}

function folderOpen(folderName) {
    loadFolders(folderName,true);
}
function folderBack()
{
    _current_folder_path = _previous_folder_path;
    loadFolders('',true);
}
function folderHome() {
    _current_folder_path = _home_folder_path;
    loadFolders('', true);
}

function loadFolders(folderName,opt=false)
{
    fetchFolder(folderName, (folders) => {
        if (folders) {
            renderFolders(folders);
            loadFiles(folderName);
        }
    },opt);
}

function loadFiles(folderName)
{
    fetchFiles(folderName, (data) => {
        renderFiles(data.files);
    });
}

function folderDelete(folderName)
{
    removeFolder(folderName, (status) => {
        if (status) {
            loadFolders('',false);
        }
    });
}

function contentSortBy(sortBy) {
    if(_content_sort_method != sortBy && sortBy == 'default'){
        _content_sort_method = 'default_';
    }
    else{
        _content_sort_method = sortBy;
    }
    let tempFolders = _last_requested_folder_response;
    renderFolders(tempFolders.subFolders);
}
function sortFolders(folders) {
    if(_content_sort_method == 'default') return;
    if (_content_sort_method == 'name') {
        folders.sort(function (a, b) {
            var x = a.folderName.toLowerCase();
            var y = b.folderName.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    } else if (_content_sort_method == 'date') {
        folders.sort(function (a, b) {
            var x = a.createdOn.toLowerCase();
            var y = b.createdOn.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        }).reverse();
    } else{
        _content_sort_method = 'default';
        folders.sort(function (a, b) {
            var x = a.createdOn.toLowerCase();
            var y = b.createdOn.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    }
}

function sortFiles(files) {
    if(_content_sort_method == 'default') return;
    if (_content_sort_method == 'name') {
        files.sort(function (a, b) {
            var x = a.fileName.toLowerCase();
            var y = b.fileName.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    } else if (_content_sort_method == 'date') {
        files.sort(function (a, b) {
            var x = a.modifiedOn.toLowerCase();
            var y = b.modifiedOn.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        }).reverse();
    } else{
        _content_sort_method = 'default';
        files.sort(function (a, b) {
            var x = a.modifiedOn.toLowerCase();
            var y = b.modifiedOn.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    }
}

basicModal.ondragover = basicModal.ondragenter = function (evt) {
    evt.preventDefault();
};

basicModal.ondrop = function (evt) {
    formFileMultiple.files = evt.dataTransfer.files;
    const dT = new DataTransfer();
    dT.items.add(evt.dataTransfer.files[0]);
    formFileMultiple.files = dT.files;
    evt.preventDefault();
};

function uploadFiles() {
    if (formFileMultiple.files.length > 0) {
        renderUploadProgress();
        $("#UPname").html(formFileMultiple.files[0].name);
        $("#UPtsize").html(formatBytes(formFileMultiple.files[0].size, 3));
        upload(formFileMultiple.files[0], (status, resp) => {
            if((!status && !resp) || resp.status == 'success'){
                removeFile(0);
                $('#UPBTN').click();
            }
            else{
                handelUploadError(11, resp.error);
                setTimeout(() => {
                    removeFile(0);
                    $('#UPBTN').click();
                }, 10000);
            }
            setTimeout(() => {
                loadFiles();
            }, 1000);
        });
    }
}

function handelUploadError(statusCode,message){
    switch(statusCode){
        case 0:
            $("#fileList").html("Upload Aborted. Next File upload process will start in 10sec");
            break;
        case 1:
            $("#fileList").html("Upload failed!. Next File upload process will start in 10sec");
            break;
        case 11:
            $("#fileList").html(message +'! Next File upload process will start in 10 seconds');
            break;
        default:
            $("#fileList").html("ERROR: file upload process stopped");
            break;        
    }
}

$("#formFileMultiple").change(function () {
    renderTableFiles(formFileMultiple.files);
});

setTimeout(function () {
    loadFolders('');
},200);



// remove file from the list
function removeFile(index) {
    let dt = new DataTransfer();
    let input = document.getElementById('formFileMultiple');
    let { files } = input;
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (index !== i)
            dt.items.add(file);
    }
    input.files = dt.files ;
    renderTableFiles(input.files);
}


// check for site idle for more than 5 minutes on gobal events
// var idleTime = 0;
// $(document).ready(function () {
//     $(this).mousemove(function (e) {
//         idleTime = 0;
//     });
//     $(this).keypress(function (e) {
//         idleTime = 0;
//     });
// }
// );
// setInterval(function () {
//     idleTime = idleTime + 1;
//     if (idleTime > 5) {
//         window.location.reload();
//     }
// }
// , 24000);
