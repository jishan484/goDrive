function loadSharedFile() {
    let params = location.pathname.split("/");
    let datas = {
        tokenId: params[params.length - 1]
    }
    $.ajax({
        url: "/external/v1/file",
        type: "POST",
        data: datas,
        success: (data, text) => {
            renderFiles(data.data.files, data.data.sharedBy);
        }
    });
}
function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Bytes';
    var k = 1024,
        dm = decimals <= 0 ? 0 : decimals || 2,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function renderFiles(files,owner = "unknown") {
    let html = '<div class="row mb-3">';

    if (files == null || files.length == 0) {
        html += `
            <div class="col-lg-12 col-md-12 col-12 mb-3">
                <div class="card">
                    <div class="card-body">
                        <div class="card-title d-flex align-items-start justify-content-between pointable">
                            <div class="avatar flex-shrink-1">
                                <img src="/image/format/404.svg" alt="chart success" style="width: 50px; height: 50px;" />
                            </div>
                            <div><h3>File Not Available</h3></div>
                            <div class="file-name"></div>
                        </div>
                        <div class="mb-3 mt-1" style="text-align:center;">
                            The file you're looking for cannot be found or the link has expired. Please check with the sender.
                        </div>
                    </div>
                <div>
            <div>`;
    } else {
        html += `
        <div class="col-lg-12 col-md-12 col-12 mb-3" style="margin-top:-0.27rem">
           <div class="card">
               <div class="card-body px-2 py-2" style="opacity:0.7;filter: hue-rotate(39deg) saturate(0.6) contrast(1.5);">
                   <div class="card-title d-flex align-items-start justify-content-between pointable mb-0 mx-2">
                       <div class="flex-shrink-1 mt-1">
                           <div style="display: inline">
                                <img src="/img/icons/unicons/share.png" alt="chart success" style="width:22px;height:22px;" />
                           </div>
                           <div style="margin-left:5px;display:inline;padding-top:7px;">Shared by ${owner}</div>
                       </div>
                       <div style="margin-top: 0px;margin-right:15px;"></div>
                       <div class="flex-shrink-1 mt-1">
                       <div style="margin-right:5px;display:inline;padding-top:7px;">Public</div>
                           <div style="display: inline">
                                <img src="/img/icons/unicons/view.png" alt="chart success" style="width:22px;height:22px;" />
                           </div>
                       </div>
                   </div>
               </div>
           </div>
       </div>
        `;
        for (let i = 0; i < files.length; i++) {
            html += `
        <div class="col-lg-4 col-md-6 col-12 mb-3">
           <div class="card">
               <div class="card-body folder">
                   <div class="card-title d-flex align-items-start justify-content-between pointable">
                       <div class="avatar flex-shrink-1">
                           <img src="/image/format/${files[i].icon}" alt="chart success" style="width: 50px; height: 50px;" />
                       </div>
                   </div>
                   <div class="small file-name mx-2">${files[i].fileName}</div>
                   <div class="file-name-s mx-2"><span>${files[i].modifiedOn}</span> <span>${formatBytes(files[i].fileSize, 2)}</span></div>
                   <div class="file-name-s"></div>
                    <center class="mb-2 mt-2">
                        <a href="/external/v1/download/${files[i].downloadURL}" onclick=""
                            class="btn btn-sm btn-outline-primary">Download</a>
                    </center>
               </div>
           </div>
       </div>
            `;
        }
    }
    html += '</div>';
    $('#sharedFileDetails').html(html);
}
loadSharedFile();