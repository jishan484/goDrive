function renderFolders(folders) {
    var html = `<div class="col-lg-12 col-md-12 order-1">
                    <div class="row">`;
    for (var i = 0; i < folders.length; i++) {
        html += `<div class="col-lg-3 col-md-4 col-6 mb-3">
                   <div class="card">
                        <div class="card-body folder">
                            <div class="card-title d-flex align-items-start justify-content-between pointable">
                                <div class="avatar flex-shrink-1">
                                    <img src="image/folder_ftp.png" alt="chart success" style="width:50px;height:50px;" />
                                </div>
                                <div class="dropdown">
                                    <button class="btn p-0" type="button" id="cardOpt3"
                                        data-bs-toggle="dropdown" aria-haspopup="true"
                                        aria-expanded="false">
                                        <i class="bx bx-dots-vertical-rounded"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                        <a class="dropdown-item" href="javascript:void(0);">Star</a>
                                        <a class="dropdown-item" href="javascript:void(0);">Lock</a>
                                    </div>
                                </div>
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

function loadFolders(folderPath)
{
    fetchFolder('', (folders) => {
        if (folders) {
            renderFolders(folders);
        }
    })
}

setTimeout(function () {
    loadFolders('');
},200);
