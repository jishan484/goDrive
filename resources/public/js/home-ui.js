function loadComponent(div, componentName, targetDiv = 'component-wrapper') {
    return new Promise((resolve, reject) => {
        request('/app/u/ui/component', {name: componentName, UIroot: false, format:'html/text'}, 'GET', (response) => {
            if (response.status == 'success') {
                $('#'+targetDiv).html(response.data);
                if(div != null) {
                    $('#layout-menu > ul > .active').removeClass('active');
                    $(div).addClass('active');
                }
                resolve();
            } else {
                reject();
            }
        }, true)
    });
}
//load the user dashboard component during document onload
loadComponent('#DashboardComponent', 'dashboard');


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
                                    <li><div class="dropdown-item" onclick="folderShare('${folders[i].folderId}')">Share</div></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><div class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editModel" onclick="renderFolderRenameModel('${folders[i].folderId}','${folders[i].folderName}')">Rename</div></li>
                                    <li><div class="dropdown-item" onclick="folderCopyMove('${folders[i].folderId}')">Move</div></li>
                                    <li><div class="dropdown-item" onclick="folderDelete('${folders[i].folderName}')">Delete</div></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><div class="dropdown-item" onclick="folderUpdatePermission('${folders[i].folderId}')">Update permissions</div></li>
                                </ul>
                            </div>
                            <div class="small folder-name">${folders[i].folderName}</div>
                            <div class="folder-name-s">${folders[i].createdOn} ${(folders[i].isShared) ? "<i class='bx bx-share-alt share-icon'></i>" : ''}</div>
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
        let fileModifiedOn = new Date(files[i].modifiedOn);
        html += `<div class="col-lg-3 col-md-4 col-6 mb-3">
           <div class="card">
               <div class="card-body folder" id=${files[i].fileId} oncontextmenu="folderOptions(this,event);return false;" ondblclick="folderOpen('${files[i].fileId}')">
                   <div class="card-title d-flex align-items-start justify-content-between pointable">
                       <div class="avatar flex-shrink-1">
                           <img src="image/format/${files[i].icon}" alt="chart success" style="width: 50px; height: 50px;" />
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
                       <ul class="dropdown-menu folderOption" data-popper-placement="bottom-start">
                            <li><div class="dropdown-item" onclick="fileDownload('${files[i].fileId}')">Download</div></li>
                            <li><div class="dropdown-item" onclick="fileShare('${files[i].fileId}')">Share</div></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><div class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editModel" onclick="renderFileUpdateModel('${files[i].fileId}','${files[i].fileName}','rename')">Rename</div></li>
                            <li><div class="dropdown-item" onclick="fileCopyMove('${files[i].fileId}')">Move</div></li>
                            <li><div class="dropdown-item" onclick="fileDelete('${files[i].fileId}')">Delete</div></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><div class="dropdown-item" onclick="fileUpdatePermission('${files[i].fileId}')">Update permissions</div></li>
                       </ul>
                   </div>
                   <div class="small file-name">${files[i].fileName}</div>
                   <div class="file-name-s">
                        <span class="mbr">${fileModifiedOn.toLocaleDateString() + " " + fileModifiedOn.getHours().toString().padStart(2, '0') + ":" + fileModifiedOn.getMinutes().toString().padStart(2, '0') }</span>
                        <span>${formatBytes(files[i].fileSize, 1)}</span>
                        ${(files[i].isShared) ? "<i class='bx bx-share-alt share-icon'></i>":''}
                    </div>
                   <div class="file-name-s"></div>
               </div>
           </div>
       </div>`;
    }
    html += '</div>';
    $('#files').html(html);
}



function renderTableFiles(files) {
    if (files.length == 0) { setTimeout(() => { $('#fileList').html('') }, 500); return; }
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
    for (let i = 0; i < files.length && i < 300; i++) {
        html += `<tr>
                    <td>${files[i].name}</td>
                    <td>${formatBytes(files[i].size, 2)}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="removeFile(${i})">Remove</button></td>
                </tr>`;
    }
    html += `</tbody>
                </table>
            </div>`;
    $('#fileList').html(html);
}

function renderUploadProgressFolder() {
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
            <span>Folder Name: </span><span id="UPname">${_currentUploadingFOlderPath}</span>
        </div>
        <div class="col-md-12 col-lg-12 col-sm-12">
            <span>Target Folder: </span><span id="UPname">${_currentUploadFolder + '/' + _currentUploadingFOlderPath}</span>
        </div>
        <div class="col-md-6 col-lg-6 col-sm-6">
            <span>Files Uploaded: </span><span id="UPspeed">${_totalUploadedFiles}</span>
        </div>
        <div class="col-md-6 col-lg-6 col-sm-6">
            <span>Folders Completed: </span><span id="UPtsize">${_currentUploadedFolderList.size - 1}</span>
        </div>
        <div class="col-md-12 col-lg-12 col-sm-12">
            <span>File name: </span><span id="UPname">${_currentUploadingFileName}</span>
        </div>
        <div class="col-md-6 col-lg-6 col-sm-6">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="cancleAllUploads();"> Cancle All Uploads </button>
        </div>
    </div>`;
    $('#fileList').html(html);
}

function renderUploadProgress() {
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

function renderFolderRenameModel(folderId, folderName) {
    let html =
        `<div class="row">
     <div class="col mb-3">
       <label for="nameWithTitle" class="form-label"> Folder Name</label>
       <input type="text" id="editModelInput1" class="form-control" placeholder="Enter New Name" value="${folderName}">
     </div>
   </div>
   <div class="row g-2">
     <div class="col mb-0 small" id="editModelError"></div>
   </div>`;
    $('#modelEditBody').html(html);
    html = `<button type="button" class="btn btn-outline-secondary" id='editModelClose' data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="folderRename('${folderId}')">Rename</button>`;
    $('#modelEditActions').html(html);
    $('#modalEditCenterTitle').html('Edit <span style="color:#696cff;">' + folderName + '</span>');
    setTimeout(() => { $('#editModelInput1').focus(); }, 500);
}

function folderRename(folderId) {
    folderName = $("#editModelInput1").val();
    updateFolderName(folderName, folderId);
}

function renderFileUpdateModel(fileId, fileName, updateType) {
    let html =
        `<div class="row">
     <div class="col mb-3">`;
    if (updateType == 'rename') {
        html +=
            `<label for="nameWithTitle" class="form-label"> File Name</label>
         <input type="text" id="editModelInput1" class="form-control" placeholder="Enter New Name" value="${fileName}">`;
    } else {
        html +=
            `<label for="nameWithTitle" class="form-label"> File Permission</label>
         <input type="radio" id="editModelInput2" class="form-control" placeholder="Enter New Title">`;
    }
    html +=
        `</div>
   </div>
   <div class="row g-2">
     <div class="col mb-0 small" id="editModelError"></div>
   </div>`;

    $('#modelEditBody').html(html);
    html = `<button type="button" class="btn btn-outline-secondary" id='editModelClose' data-bs-dismiss="modal">Close</button>`;
    if (updateType == 'rename') {
        html += `<button type="button" class="btn btn-primary" onclick="fileRename('${fileId}')">Rename</button>`;
    } else {
        html += `<button type="button" class="btn btn-primary" onclick="folderRename('${fileId}')">Update</button>`;
    }
    $('#modelEditActions').html(html);
    $('#modalEditCenterTitle').html('Edit <span style="color:#696cff;">' + fileName + '</span>');
    setTimeout(() => { $('#editModelInput1').focus(); }, 500);
}

function fileRename(fileId) {
    fileName = $("#editModelInput1").val();
    updateFileName(fileName, fileId);
}
function renderSharedFileInfo(resp) {
    let html = `
        <div class="modal fade show" aria-labelledby="modalToggleLabel" tabindex="-1" style="display: block;" aria-modal="true" role="dialog">
                          <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                              <div class="modal-header py-1">
                                <h4 class="modal-title" id="modalToggleLabel">Copy Link Address</h4>
                              </div>
                              ${(resp.type=='folder')?'<small class="modal-header py-1">Sharing is limited to files only. subfolders are not shared.</small>':''}
                              <div class="modal-body py-1">
                                <div class="alert alert-secondary mb-1 text-break" role="alert" id="renderSharedFileInfo_popup_url">
                                ${window.location.protocol + "//" + window.location.host + '/shared/' + resp.tokenId}
                                </div>
                                
                                <div class="btn-group centerX mt-2 mb-2 w-50" role="group" aria-label="First group" style="min-width:200px;">
                              <a type="button" class="btn btn-outline-secondary" target="_black"
                              href="whatsapp://send?text=${getTextForFileSharingWithLink(resp,"whatsapp")}">
                                <i class='bx bxl-whatsapp'></i>
                              </a>
                              <a type="button" class="btn btn-outline-secondary" target="_black"
                              href="mailto:?subject=${encodeURIComponent(resp.owner + ' Shared a ' + resp.type + ' with you!')}&body=${getTextForFileSharingWithLink(resp, "mail")}">
                                <i class='bx bx-envelope'></i>
                              </a>
                              <a type="button" class="btn btn-outline-secondary" target="_black"
                              href="sms:?body=${getTextForFileSharingWithLink(resp, "text")}">
                                <i class='bx bx-message-rounded-dots'></i>
                              </a>
                              ${(navigator.share)?`
                                <button type="button" class="btn btn-outline-secondary" onclick="shareButtonAction('${resp.owner}','${resp.type}','${resp.fileId}','${resp.folderId}','${resp.tokenId}')">
                                    <i class='bx bx-share'></i>
                                </button>
                              `:''}
                            </div>
                                
                                <div style="line-height:15px;font-size:0.74rem;" class="text-light m-1">You Can Stop Sharing This File By Clicking Cancel Sharing Button.</div>
                                <div class="mt-2">
                                    <button type="button" onclick="cancelSharedFileorFolder('${resp.type}','${resp.tokenId}')" class="btn btn-sm btn-outline-secondary"><i class='bx bx-x'></i>Cancel Sharing</button>
                                </div>
                              </div>
                              <div class="modal-footer">
                                <button class="btn btn-danger" onclick="$('#popups-wrapper').html('')">
                                  Close
                                </button>
                                <button class="btn btn-primary" id = "renderSharedFileInfo_popup_button"
                                onclick="copyText('renderSharedFileInfo_popup_url', this)">
                                <i class='bx bx-share-alt'></i> Copy Link
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
    `;

    $("#popups-wrapper").html(html);
}
function renderRequestFileInfo(resp) {
    resp.description = (resp.description == '')?'Please Upload the Requested File.':resp.description;
    let html = `
        <div class="modal fade show" aria-labelledby="modalToggleLabel" tabindex="-1" style="display: block;" aria-modal="true" role="dialog">
                          <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                              <div class="modal-header py-1">
                                <h4 class="modal-title" id="modalToggleLabel">Copy Link Address</h4>
                              </div>
                              <small class="modal-header py-1">Share the link with the user to request the file.</small>'
                              <div class="modal-body py-1">
                                <div class="alert alert-secondary mb-1 text-break" role="alert" id="renderSharedFileInfo_popup_url">
                                ${window.location.protocol + "//" + window.location.host + '/request/' + resp.tokenId}
                                </div>
                                <div class="btn-group centerX mt-2 mb-2 w-50" role="group" aria-label="First group" style="min-width:200px;">
                              <a type="button" class="btn btn-outline-secondary" target="_black"
                              href="whatsapp://send?text=${getTextForFileRequestWithLink(resp,"whatsapp")}">
                                <i class='bx bxl-whatsapp'></i>
                              </a>
                              <a type="button" class="btn btn-outline-secondary" target="_black"
                              href="mailto:?subject=${encodeURIComponent(resp.requester + ' has requested you to upload a file!')}&body=${getTextForFileRequestWithLink(resp, "mail")}">
                                <i class='bx bx-envelope'></i>
                              </a>
                              <a type="button" class="btn btn-outline-secondary" target="_black"
                              href="sms:?body=${getTextForFileRequestWithLink(resp, "text")}">
                                <i class='bx bx-message-rounded-dots'></i>
                              </a>
                              ${(navigator.share)?`
                                <button type="button" class="btn btn-outline-secondary" onclick="shareButtonActionForRequestFile('${resp.requester}','${resp.type}','${resp.fileId}','${resp.folderId}','${resp.tokenId}')">
                                    <i class='bx bx-share'></i>
                                </button>
                              `:''}
                            </div>
                                
                                <div style="line-height:15px;font-size:0.74rem;" class="text-light m-1">You can share the link below with the targeted user to request the file.</div>
                                <div style="line-height:15px;font-size:0.84rem; color:#ffa083;text-align:center;" class="form-control m-1">The user can upload the file using this link without authentication.</div>
                                
                              </div>
                              <div class="modal-footer">
                                <button class="btn btn-danger" onclick="$('#popups-wrapper').html('')">
                                  Close
                                </button>
                                <button class="btn btn-primary" id = "renderSharedFileInfo_popup_button"
                                onclick="copyText('renderSharedFileInfo_popup_url', this)">
                                <i class='bx bx-share-alt'></i> Copy Link
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
    `;

    $("#popups-wrapper").html(html);
}




//-------------for home-main.js------------------

function folderOptions(elem, event) {
    event.preventDefault();
    event.stopPropagation();
    var folderId = elem.id;
    if ($(elem).find('.folderOption').hasClass('show')) return false;
    $(document).off('click');
    $('.folderBodyOption').removeClass('show');
    $('#' + folderId + ' .folderOption').toggleClass('show');
    $('.folderOption').not($('#' + folderId + ' .folderOption')).removeClass('show');
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.folderOption').length) {
            $('.folderOption').removeClass('show');
            $(document).off('click');
        }
    });
    return false;
}

function folderBodyOptions(elem, event) {
    $('#bodyOptions .folderBodyOption').addClass('show');
    // update folder body options position relative to the clicked element
    $("#itemPaste").toggleClass('disabled', !_currentClipboard.active);
    let folderBodyOption = $('#bodyOptions .folderBodyOption');
    let folderBodyOptionWidth = folderBodyOption.width();
    let folderBodyOptionHeight = folderBodyOption.height();
    let folderBodyOptionTop = event.pageY - (folderBodyOptionHeight * 0.5);
    let folderBodyOptionLeft = event.pageX - (folderBodyOptionWidth * 0.75);
    folderBodyOption.css({
        top: folderBodyOptionTop,
        left: folderBodyOptionLeft
    });
    $('.folderOption').removeClass('show');
    $('#bodyOptions > ul > li > .dropdown-item:not(".disabled")').on('click', function (e) {
        $('.folderBodyOption').removeClass('show');
        $('#bodyOptions > ul > li > .dropdown-item:not(".disabled")').off('click');
    });
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
    loadFolders(folderName, true).then(() => {
        _folder_scroll_position_history.push($(document).scrollTop().valueOf());
        $([document.documentElement, document.body]).animate({
            scrollTop: 0
        }, 200);
    });
}
function folderBack() {
    _current_folder_path = _previous_folder_path;
    loadFolders('', true).then(() => {
        $([document.documentElement, document.body]).animate({
            scrollTop: _folder_scroll_position_history.pop()
        }, 200);
    });
}
function folderHome() {
    _current_folder_path = _home_folder_path;
    loadFolders('', true).then(() => {
        $([document.documentElement, document.body]).animate({
            scrollTop: _folder_scroll_position_history[0]
        }, 200);
        _folder_scroll_position_history = [];
    });
}

async function loadFolders(folderName, opt = false) {
    return new Promise((resolve, reject) => {
        fetchFolder(folderName, (folders) => {
            if (folders) {
                resolve(); // before renderFolders save scroll position
                renderFolders(folders);
                loadFiles(folderName);
            } else {
                reject();
            }
        }, opt);
    });
}


function copyText(id, elm, newClass="btn btn-success") {
    if (navigator && navigator.clipboard) {
        navigator.clipboard.writeText($("#" + id).text().replace(/\n| /g, "")).then(function () {
            $(elm).html('Copied').removeClass().addClass(newClass).delay(1000).queue(function (next) { $('#popups-wrapper').html(''); next(); })
        }, function () {
            alert('Failure to copy. Please Manually copy the link!')
        });
    } else {
        var r = document.createRange();
        r.selectNode(document.getElementById(id));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(r);
        try {
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            $(elm).html('Copied').removeClass().addClass(newClass).delay(1000).queue(function (next) { $('#popups-wrapper').html(''); next(); })
        } catch (err) {
            alert('Unable to copy!');
        }
    }
}

function folderCopyMove(folderId) {
    _currentClipboard.active = true;
    _currentClipboard.type = 'folder';
    _currentClipboard.id = folderId;
    _currentClipboard.path = _current_folder_path;
    _currentClipboard.name = _current_folder_name;
    successToast("Paste the folder in new location");
    // hide the folder options
    setTimeout(() => {
        $('.folderOption').removeClass('show');
    }, 250);
}

function fileCopyMove(fileId) {
    _currentClipboard.active = true;
    _currentClipboard.type = 'file';
    _currentClipboard.id = fileId;
    _currentClipboard.path = _current_folder_path;
    successToast("Paste the file in new location");
    // hide the folder options
    setTimeout(() => {
        $('.folderOption').removeClass('show');
    }, 250);
}

function pasteClipboard() {
    if (!_currentClipboard.active) return;
    if (_currentClipboard.type == 'folder') {
        updateFolder('location', _currentClipboard, null, null, pasteClipboardCallback);
    } else if (_currentClipboard.type == 'file') {
        updateFile('location', _currentClipboard, _currentClipboard.id, null, pasteClipboardCallback);
    }
}

function pasteClipboardCallback(response) {
    if (response.status != 'error') {
        successToast(_currentClipboard.type.charAt(0).toUpperCase() + _currentClipboard.type.substring(1) + " moved successfully");
        $('.folderBodyOption').removeClass('show');
        if (_currentClipboard.type == 'folder') {
            fetchFolder('', (folders) => {
                if (folders) {
                    renderFolders(folders);
                }
            }, false);
        } else {
            loadFiles('', (files) => {  //ioio
                if (files) {
                    renderFiles(files);
                }
            });
        }
        _currentClipboard.active = false;
        _currentClipboard.type = null;
        _currentClipboard.id = null;
        _currentClipboard.path = null;
    } else {
        successToast(response.error);
    }
}

function loadFiles(folderName) {
    fetchFiles(folderName, (data) => {
        renderFiles(data.files);
    });
}

function folderDelete(folderName) {
    let status = confirm("Are you sure you want to delete this folder?");
    if (status) {
        removeFolder(folderName, (status) => {
            if (status) {
                loadFolders('', false);
                successToast("Folder deleted successfully");
            }
        });
    }
}

function contentSortBy(sortBy) {
    if (_content_sort_method != sortBy && sortBy == 'default') {
        _content_sort_method = 'default_';
    }
    else {
        _content_sort_method = sortBy;
    }
    renderFolders(_last_requested_folder_response.subFolders);
    renderFiles(_last_requested_file_response.files)
}


function sortFolders(folders) {
    if (_content_sort_method == 'default') return;
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
    } else {
        _content_sort_method = 'default';
        folders.sort(function (a, b) {
            var x = a.createdOn.toLowerCase();
            var y = b.createdOn.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    }
}

function sortFiles(files) {
    if (_content_sort_method == 'default') return;
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
    } else {
        _content_sort_method = 'default';
        files.sort(function (a, b) {
            var x = a.modifiedOn.toLowerCase();
            var y = b.modifiedOn.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    }
}

function initDashboardEvents() {
    basicModal.ondragover = basicModal.ondragenter = function (evt) {
        evt.preventDefault();
    };

    basicModal.ondrop = function (evt) {
        formFileMultiple.files = evt.dataTransfer.files;
        const dT = new DataTransfer();
        dT.items.add(evt.dataTransfer.files);
        formFileMultiple.files = dT.files;
        evt.preventDefault();
    };

    $("#formFileMultiple").change(function () {
        _currentUploadFolder = _current_folder_path;
        _currentUploadType = 'file';
        renderTableFiles(formFileMultiple.files);
        if ($("#formFileMultiple")[0].files.length == 0) {
            $("#formFolderMultiple").show(500);
        } else {
            $("#formFolderMultiple").hide(500);
        }
    });

    $("#formFolderMultiple").change(function () {
        _currentUploadFolder = _current_folder_path;
        _totalUploadedFiles = 0;
        _totalUploadableFiles = formFolderMultiple.files.length;
        _currentUploadType = 'folder';
        _checkForDuplicateUpload = false;
        _uploadFaildWithError = false;
        _currentUploadedFolderList = new Map();
        renderTableFiles(formFolderMultiple.files);
        if ($("#formFolderMultiple")[0].files.length == 0) {
            $("#formFileMultiple").show(500);
        } else {
            $("#formFileMultiple").hide(500);
        }
    });
}

function uploadFiles() {
    if (_currentUploadType == 'folder') {
        uploadFolders();
        return;
    }
    if (formFileMultiple.files.length > 0) {
        $('#UPBTN').html('Cancle All');
        $('#UPBTN').attr('onclick', 'cancleAllUploads()');
        renderUploadProgress();
        $("#UPname").html(formFileMultiple.files[0].name);
        $("#UPtsize").html(formatBytes(formFileMultiple.files[0].size, 3));
        upload(formFileMultiple.files[0], _currentUploadFolder, (status, resp) => {
            if (status && resp.status == 'success') {
                removeFile(0);
                $('#UPBTN').attr('onclick', 'uploadFiles()');
                $('#UPBTN').click();
                if (_current_folder_path == _currentUploadFolder) {
                    setTimeout(() => {
                        loadFiles();
                    }, 10);
                }
            }
            else {
                let canContinue = handelUploadError(resp.status, resp.statusText, resp.readyState, resp);
                if (canContinue) {
                    let ltimeout = 5000;
                    if (formFileMultiple.files.length <= 1) {
                        ltimeout = 10;
                    }
                    setTimeout(() => {
                        $('#UPBTN').attr('onclick', 'uploadFiles()');
                        removeFile(0);
                        $('#UPBTN').click();
                    }, ltimeout);
                } else {
                    $('#UPBTN').html('Resume');
                    $('#UPBTN').attr('onclick', 'uploadFiles()');
                }
            }
        });
    }
}

async function uploadFolders() {
    _currentUploadsNewFolderList = [];
    _currentUploadsCounter = -1;
    _currentUploadsCallbackCounter = 0;
    _currentUploadingFOlderPath = '';
    _currentUploadingFileName = '';
    _checkDupCompleteCounter = 0;
    $('#fileList').html('<center>Preparing files! Pleaese wait.</center>');
    await createFoldersForUpload();
    await setTimeout(() => { }, 9000);
    for (let i = 0; i < _consecutiveUploadsCounter; i++) {
        _currentUploadsCounter++;
        uploadFolderHandler(i);
    }
}


async function createFoldersForUpload() {
    for (let i = 0; i < formFolderMultiple.files.length; i++) {
        let done = ((i / formFolderMultiple.files.length) * 100).toFixed(2);
        $('#fileList').html('<center>Preparing! Pleaese wait...  ' + done + '% completed</center>');
        let fullDirectory = formFolderMultiple.files[i].webkitRelativePath.split('/').slice(0, -1).join("/");
        if (!_currentUploadsNewFolderList.includes(fullDirectory)) {
            let splitedDir = fullDirectory.split('/');
            let joinedDir = '';
            for (let j = 0; j < splitedDir.length; j++) {
                let dir = splitedDir[j];
                if (joinedDir != '') joinedDir += '/' + dir;
                else joinedDir = dir;
                if (!_currentUploadsNewFolderList.includes(joinedDir)) {
                    _currentUploadsNewFolderList.push(joinedDir);
                }
            }
        }
    }
    // send request to create folders
    await new Promise((resolve, reject) => {
        createFolderDuringUpload(_currentUploadFolder, _currentUploadsNewFolderList, (resp) => {
            resolve(true);
            if (resp.code == 111) {
                _checkForDuplicateUpload = true;
            }
        }, false);
    });
}

function uploadFolderHandler(startIndex) {
    let flen = formFolderMultiple.files.length;
    if (_currentUploadsCounter >= flen) {
        _currentUploadsCallbackCounter++;
        if (_currentUploadsCallbackCounter == _consecutiveUploadsCounter) {
            removeFile(0);
        }
    } else {
        uploadFilesWithFolder(formFolderMultiple.files[startIndex], _currentUploadFolder, (status, resp, trackIndex) => {
            if (status && resp.status == 'success') {
                _totalUploadedFiles++;
                if (_currentUploadsCounter >= formFolderMultiple.files.length) {
                    _currentUploadingFileName = formFolderMultiple.files[0].name;
                    removeFile(0);
                    if (formFolderMultiple.files.length == 0 && _current_folder_path == _currentUploadFolder) {
                        setTimeout(() => {
                            loadFolders('');
                        }, 10);
                    }
                } else {
                    _currentUploadingFileName = formFolderMultiple.files[trackIndex].name;
                    removeFile(trackIndex);
                }
                if (_checkForDuplicateUpload == true) {
                    _checkDupCompleteCounter++;
                    if (_checkDupCompleteCounter >= 10 && _uploadFaildWithError == true) {
                        _checkForDuplicateUpload = false;
                        _uploadFaildWithError = false;
                        _checkDupCompleteCounter = 0;
                    }
                }
                renderUploadProgressFolder();
                let progressValue = _totalUploadedFiles / _totalUploadableFiles * 100;
                $('#uploadProgress')[0].style.width = progressValue + '%';
                uploadFolderHandler(_currentUploadsCounter);
            }
            else {
                let status = handelUploadError(resp.status, resp.statusText, resp.readyState, resp);
                if (!status) {
                    _checkForDuplicateUpload = true;
                    _uploadFaildWithError = true;
                }
                // folder uploads not abortable:
                // Only can be continued if fails!
            }
        }, startIndex, false);
    }
}


function uploadFilesWithFolder(file, path, callback, trackIndex, showProgress) {
    let fullDirectory = file.webkitRelativePath.split('/').slice(0, -1).join("/");
    _currentUploadedFolderList.set(fullDirectory, 1);
    if (!_currentUploadsNewFolderList.includes(fullDirectory)) {
        let splitedDir = fullDirectory.split('/');
        let joinedDir = '';
        splitedDir.forEach((dir) => {
            let oldDir = joinedDir;
            if (joinedDir != '') joinedDir += '/' + dir;
            else joinedDir = dir;
            if (!_currentUploadsNewFolderList.includes(joinedDir)) {
                console.error(joinedDir, "Not found! skipping current folder");
            }
        });
    } else {
        let uploadDir = _currentUploadFolder + '/' + fullDirectory;
        _currentUploadingFOlderPath = fullDirectory;
        upload(file, uploadDir, callback, trackIndex, showProgress, _checkForDuplicateUpload);
    }
}

function handelUploadError(statusCode, message, readyState, resp) {
    let canContinue = false;
    if (statusCode == 0 && readyState == 0) {
        if (message == 'abort') {
            $("#fileList").html("Upload cancelled! Next File upload process will start in 5 seconds.");
            canContinue = true;
        } else if (message == 'error' && statusCode == 1) {
            $("#fileList").html('File is not uploadable!');
        } else if (message == 'error' && _systemOnlineStatus == false) {
            $("#fileList").html('You are currently offline! Please resume the uploads again.');
        } else if (message == 'error' && _systemOnlineStatus == true) {
            canContinue = true;
        } else {
            $("#fileList").html('Unknown error! Please manually resume the uploads!');
        }
    } else {
        $('#fileList').html(resp.error);
    }
    return canContinue;
}


// cancle all uploads
function cancleAllUploads() {
    let consent = confirm('Do you really want to cancle all uploads!');
    if (consent) {
        let dt = new DataTransfer();
        let input = document.getElementById('formFileMultiple');
        if (_currentUploadType == 'folder') {
            input = document.getElementById('formFolderMultiple');
        }
        input.files = dt.files;
        _globalUPjax.abort();
        setTimeout(() => {
            loadFiles();
        }, 10);
    }
}

// remove file from the list
function removeFile(index) {
    let dt = new DataTransfer();
    let input = document.getElementById('formFileMultiple');
    if (_currentUploadType == 'folder') {
        input = document.getElementById('formFolderMultiple');
    }
    let { files } = input;
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (index !== i)
            dt.items.add(file);
    }
    input.files = dt.files;
    if (input.files.length == 0) {
        $('#UPBTN').html('Upload Files');
        $('#UPBTN').attr('onclick', 'uploadFiles()');
    }
    if (_currentUploadType == 'file' && input.files.length == 0) {
        $("#formFileMultiple").change();
    } else if (_currentUploadType == 'folder' && input.files.length == 0) {
        $("#formFolderMultiple").change();
    }
    renderTableFiles(input.files);
}

// for file options

function fileDownload(fileId) {
    var path = window.location.protocol + "//" + window.location.host + '/app/u/file/download?fileId=' + fileId;
    var a = document.createElement('A');
    a.href = path;
    a.download = path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function fileShare(fileId) {
    shareFileorFolder('file', fileId, 'POST', (response) => {
        if (response && response.status != 'error') {
            $("#" + fileId).click();
            renderSharedFileInfo(response.data);
        }
    });
}
function cancelSharedFileorFolder(type, tokenId) {
    shareFileorFolder(type, tokenId, 'DELETE', (response) => {
        if (response && response.status != 'error') {
            $('#popups-wrapper .modal-content').animate({ opacity: 0 }, 1000, function () {
                $("#popups-wrapper").html('');
            });
            successToast("The file is no longer shared.");
        }
    });
}
function folderShare(fileId) {
    shareFileorFolder('folder', fileId, 'POST', (response) => {
        if (response && response.status != 'error') {
            $("#" + fileId).click();
            renderSharedFileInfo(response.data);
        }
    });
}


function fileDelete(fileId) {
    deleteFile(fileId, () => {
        loadFiles();
    }, true);
}

function updateFileName(name, fileId) {
    updateFile('name', name, fileId, null, (response) => {
        if (response.status != 'error') {
            $("#editModelClose").click();
            loadFiles();
        } else {
            $("#editModelError").html(response.error);
        }
    });
}

function updateFolderName(name, folderId, folderName) {
    updateFolder('name', name, folderId, folderName, (response) => {
        if (response.status != 'error') {
            $("#editModelClose").click();
            fetchFolder('', (folders) => {
                if (folders) {
                    renderFolders(folders);
                }
            }, false);
        } else {
            $("#editModelError").html(response.error);
        }
    });
}

function updateFolderLocation(location, folderId, folderName) {
    updateFolder('location', location, folderId, folderName, (status, response) => {
        if (status) {
            loadFolders('', false);
        }
    });
}

function shareButtonAction(owner, type, fileId, folderId, tokenId) {
    let fileOrFolder = (type == 'file') ? _last_requested_file_response.files.filter(x => (x.fileId == fileId))[0] :
        _last_requested_folder_response.subFolders.filter(x => (x.folderId == folderId))[0];
    if (navigator.share) {
        navigator.share({
            title: `${owner} has shared a ${type} with you.`,
            text: 
`${owner} has shared a ${type} with you.
${(type=='file') ? `📄 File Name: ${fileOrFolder.fileName}
💾 File Size: ${formatBytes(fileOrFolder.fileSize, 1)}` : `📁 Folder Name: ${fileOrFolder.folderName}`}
You can download the file using the following link:`,
            url: window.location.protocol + "//" + window.location.host + '/shared/' + tokenId,
        })
            .then(() => successToast(`${type} shared successfully!`))
    } else {
        errorToast('This Option is not supported on this device.');
    }
}

function getTextForFileSharingWithLink(resp, type="whatsapp") {
    let details = '';
    let isFile_ = (resp.type == 'file')
    let fileOrFolder = (isFile_) ? _last_requested_file_response.files.filter(x => (x.fileId == resp.fileId))[0]:
        _last_requested_folder_response.subFolders.filter(x => (x.folderId == resp.folderId))[0];
    fileOrFolder = (!isFile_ && fileOrFolder == null) ? _last_requested_folder_response : fileOrFolder 
        let link = window.location.protocol + "//" + window.location.host + '/shared/' + resp.tokenId;
    if(type == "whatsapp"){
        details +=
`*${resp.owner}* has shared a ${resp.type} with you.
${isFile_ ? `> *📄 File Name:* ${fileOrFolder.fileName}
> *💾 File Size:* ${formatBytes(fileOrFolder.fileSize, 1)}` : `> *📁 Folder Name:* ${fileOrFolder.folderName}`}
You can download the file using the following link:
> 📥 _${link}_
`;
    } else if (type == "mail") {
        details += `
Hello,

${resp.owner} has shared a file with you. Below are the details. Please use the link to download or access the file.
${isFile_ ? `
    File: ${fileOrFolder.fileName}
    Size: ${formatBytes(fileOrFolder.fileSize, 1)}` :`
    Folder: ${fileOrFolder.folderName}`}
    Sender: ${resp.owner}

${link}


    © ${new Date().getFullYear()}, made with ❤️ by MiFi`;
    } else if(type == "text") {
        details += `
Hello,

${resp.owner} has shared a file with you
${isFile_ ? `
    File: ${fileOrFolder.fileName}
    Size: ${formatBytes(fileOrFolder.fileSize, 1)}` :
                `
    Folder: ${fileOrFolder.folderName}`}

You can download the file :here: ${link}`
    }
    return encodeURIComponent(details.trim());
}

function getTextForFileRequestWithLink(resp, type="whatsapp") {
    let details = '';
        let link = window.location.protocol + "//" + window.location.host + '/request/' + resp.tokenId;
    if(type == "whatsapp"){
        details +=
`*${resp.requester}* has requested you to upload a file.
> *💾 File Name:* ${resp.fileName}
> *📄 File Description:* ${resp.description} ${(resp.note!=undefined && resp.note!='')? `
> *📝 Note:* ${resp.note}` : ""} ${(resp.lebel!=undefined && resp.lebel!='')? `
> *🪧 Lebel:* ${resp.lebel}` : ""}
You can use the link below to upload the file.
> 📡 _${link}_
`;
    } else if (type == "mail") {
        details += `
Hello,

${resp.requester} has requested you to upload a file. Below are the details. Please use the link to upload the file.
    File: ${resp.fileName}
    Description: ${resp.description} ${(resp.note!=undefined && resp.note!='')? `
    Note: ${resp.note}` : ""} ${(resp.lebel!=undefined && resp.lebel!='')? `
    Lebel: ${resp.lebel}` : ""} ${(resp.fileType!=undefined && resp.fileType!='')? `
    File Type: ${resp.fileType}` : ""}
    Requester: ${resp.requester}

${link}


    © ${new Date().getFullYear()}, made with ❤️ by MiFi`;
    } else if(type == "text") {
        details += `
Hello,

${resp.requester} has requested you to upload a file.
    File: ${resp.fileName}
    Description: ${resp.description}
    ${(resp.note!=undefined && resp.note!='')? `Note: ${resp.note}` : ""}

Please use the link to upload the file. :here: ${link}`
    }
    return encodeURIComponent(details.trim());
}

function shareButtonActionForRequestFile(owner, fileName, description, note, tokenId) {
    if (navigator.share) {
        navigator.share({
            title: `${owner} has requested a file`,
            text: 
`${owner} has requested you to upload a file.
    File: ${fileName}
    Description: ${description}
    ${(note==undefined)? `Note: ${note}` : ""}
Please use the link to upload the file.`,
            url: window.location.protocol + "//" + window.location.host + '/request/' + tokenId,
        })
            .then(() => successToast(`Request shared successfully!`))
    } else {
        errorToast('This Option is not supported on this device.');
    }
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
