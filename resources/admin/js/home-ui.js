// UI component loader : This will load html codes for different pages

function loadComponent(div,componentName, targetDiv = 'component-wrapper'){
    return new Promise((resolve, reject) => {
        request('/admin/u/ui/component', {name: componentName, UIroot: false, format:'html/text'}, 'GET', (response) => {
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
//load the dashboad component during document onload
loadComponent(this, 'dashboard');




function renderDrives(drives){
    if(drives.length == 0){
        $('#connectedDrives > div > div > p').html('No connected drive found');
        return;
    }
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


function renderDashboardStats(data){
    if ($('#dashboard').length){
        $('#usersCount').html(data.usersCount);
        $('#drivesCount').html(data.drivesCount);
        $('#logsCount').html(data.logsCount);
        $('#messagesCount').html(data.messagesCount);
        // server actions
        for (let key in data.serverStatus) {
            if (data.serverStatus[key]){
                $('#' + key).html('Active');
                $('#' + key).toggleClass('bg-label-secondary').addClass('bg-label-primary')
            } else {
                $('#' + key).html('inactive');
                $('#' + key).toggleClass('bg-label-secondary').addClass('bg-label-warning')
            }
        }
    }
}


function renderTasks(tasks){
    if($('#tasks-list').length > 0){
        let data = '';
        for (let i = 0; i < tasks.length; i++) {
            data += `<tr>
                        <td><i class="bx bx-task"></i> <strong>${tasks[i].name}</strong></td>
                        <td><span class="badge bg-label-secondary">${tasks[i].frequency}</span></td>
                        <td><span class="badge bg-label-secondary">${(tasks[i].status==1)?'Active':'Inactive'}</span></td>
                        <td><span class="badge bg-label-success">${tasks[i].lastRun}</span></td>
                        <td>
                          <button type="button" class="btn btn-xs btn-outline-warning" onclick="editTasks('${tasks[i].name}','${tasks[i].frequency}')">Edit</button>                        
                          <button type="button" class="mx-1 btn btn-xs btn-outline-primary" onclick="runTasks(this,'${tasks[i].name}')">Run</button>`;
            if(tasks[i].status == 0){
                data += `<button type="button" class="mx-1 btn btn-xs btn-outline-success" onclick="updateTaskStatus('${tasks[i].name}',true)">Enable</button>`;
            } else {
                data += `<button type="button" class="mx-1 btn btn-xs btn-outline-danger" onclick="updateTaskStatus('${tasks[i].name}',false)">Disable</button>`;
            }
            data+=       `</td>
                      </tr>`;
        }
        $('#tasks-list').html(data);
        $('#editTask-name').html('TASK NAME : '+tasks[0].name);
        populateEditTaskInputValue(tasks[0].frequency);
    }
}

function resnderUsers(users){
    if($('#user-list').length > 0){
        let data = '';
        for (let i = 0; i < users.list.length; i++) {
            let user = users.list[i].userName;
            let status = users.list[i].status;
            let msgBTN = (user == users.currentUser) ? "disabled" : "";
            let updBTN = (status == 1) ? "danger" : "primary";
            let oppsiteStatus = (status == 1) ? 'disable' : 'active';
            data += `<tr>
                      <td><img src="${(users.list[i].profile == "") ? "../image/demo.jpeg" : "../"+users.list[i].profile}" width="25px"></td>
                      <td><strong>${user}</strong></td>
                      <td><span class="badge bg-label-secondary me-1">${users.list[i].role}</span></td>
                      <td><span class="badge bg-label-success">${(status==1)?"Active":"Disabled"}</span></td>
                      <td>
                        <button type="button" class="btn btn-xs btn-outline-success ${msgBTN}">Message</button>
                        <button type="button" onclick="updateUserStatus('${user}','${oppsiteStatus}')" class="mx-1 btn btn-xs btn-outline-${updBTN} ${msgBTN}">${(status == 1) ? "Disable" : "Active"}</button>
                      </td>
                    </tr>`;
        }
        $('#user-list').html(data);
    }
}

//=============================================================

function fetchDrives(callback){
    request('/admin/u/drive',{},'GET',(response)=>{
        if (response.status == 'success') {
            callback(response.data);
        }
    },true)
}

function fetchDashboardStats(callback){
    request('/admin/u/status', {}, 'GET', (response) => {
        if (response.status == 'success') {
            callback(response.data);
        }
    }, true)
}

function fetchTasksDetails(progress = true,callback){
    request('/admin/u/task', {}, 'GET', (response) => {
        if (response.status == 'success') {
            callback(response.data);
        }
    }, progress)
}

function fetchUsers(callback){
    request('/admin/u/user',{},'GET',(response)=>{
        if (response.status == 'success') {
            callback(response.data);
        }
    })
}

// initiators =====================
function loadDrives(){
    fetchDrives((drives)=>{
        renderDrives(drives);
    });
}


function loadDashboardStats(){
    fetchDashboardStats((status)=>{
        renderDashboardStats(status);
        if(status.refreshRequired == true){
            setTimeout(()=>{
                loadDashboardStats();
            },5000);
        }
    })
}

function loadTasks(progress){
    fetchTasksDetails(progress,(tasks)=>{
        renderTasks(tasks);
    });
}

function loadUsers(){
    fetchUsers((users)=>{
        resnderUsers(users);
    });
}




