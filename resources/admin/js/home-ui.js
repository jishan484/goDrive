function renderDrives(drives){
    if(drives.length == 0) return;
    let html = 
    `<div class="card">
        <h5 class="card-header">Connected Drives</h5>
            <div class="card-body">
                <p>${drives.length} connected drive found</p>`;
    for(let i=0;i<drives.length;i++){
        html+=`<div class="d-flex mb-3">
                    <div class="flex-shrink-0">
                        <img src="../img/icons/brands/${drives[i].type.replace('Drive', '')}.png" alt="${drives[i].type}" class="me-3" height="30">
                    </div>
                    <div class="flex-grow-1 row">
                        <div class="col-9 mb-sm-0 mb-2">
                            <h6 class="mb-0 text-clip">${drives[i].name}</h6>
                            <small class="text-muted">${formatBytes(drives[i].freeSpace)} free space</small>
                        </div>
                        <div class="col-3 text-end">
                            <span class="badge bg-label-success">${drives[i].status}</span>
                        </div>
                    </div>
                </div>`;
    }
    html += `</div>
        </div>`;
    $('#connectedDrives').html(html);
}





//=============================================================

function fetchDrives(callback){
    request('/admin/u/drive',{},'GET',(response)=>{
        if (response.status == 'success') {
            callback(response.data);
        }
    },true)
}

function loadDrives(){
    fetchDrives((drives)=>{
        renderDrives(drives);
    })
}

setTimeout(()=>{
    loadDrives();
},100);