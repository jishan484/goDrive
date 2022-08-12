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
        }
    },opt);
}

function folderDelete(folderName)
{
    console.log(folderName);
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

setTimeout(function () {
    loadFolders('');
},200);


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
