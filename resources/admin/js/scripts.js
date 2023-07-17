function runTasks(div, name){
    $(div).addClass('disabled');
    $(div).parent().parent().animate({ opacity: 0.6 },600).animate({ opacity: 1 }, 1200);
    request('/admin/u/task/run', {action:'RUN', name: name}, 'POST', (response) => {
        if (response.status == 'success') {
            setTimeout(()=>{
                loadTasks(false);
            },1000);
        }
    }, true);
}
function editTasks(name , frequency){
    $('#editTask-name').html('TASK NAME : ' + name);
    populateEditTaskInputValue(frequency);
}

function populateEditTaskInputValue(value){
    $("#editTask-value").html(value);
    let values = value.split(' ');
    let divs = ['#editTask-minute', '#editTask-hour', '#editTask-day', '#editTask-month', '#editTask-year']
    let count = 0;
    divs.forEach(div => {
        if (values[count][0] == '*') {
            $(div+' > select').val('*/');
            if (values[count][1] == '/') $(div+' > input').val(values[count].slice(2))
            else $(div + ' > input').val('');
        }
        else {
            $(div+' > select').val('');
            $(div+' > input').val(values[count]);
        }
        count++;
    });   
}

function recalculateCRON(){
    let divs = ['#editTask-minute', '#editTask-hour', '#editTask-day', '#editTask-month', '#editTask-year']
    let result = '';
    divs.forEach(div => {
        let expression = $(div + ' > select').val();
        let value = $(div + ' > input').val();
        if(value == null || value == ''){
            expression = '*';
        }
        result+=expression+value+' ';
    });
    $("#editTask-value").html(result);
}

//  create user profile
function createUserProfile(){
    let data = {};
    data.user = $('#userName').val();
    let password1 = $('#password1').val();
    data.password = $('#password2').val();
    data.role = $('#userType').val();
    if(data.password != password1){
        $('#createUsererror').html('Password does not match!');
        return;
    }
    request('/admin/u/user', data, 'POST', (response) => {
        if (response.status == 'success') {
            loadUsers();
            $('#createUsererror').html("Successfully created user!");
            setTimeout(()=>{
                $('#closecreateProfileModalbtn').click();
            },1000);
        } else {
            $('#createUsererror').html(response.error);
        }
    }, true);
}

function updateUserStatus(userName, status){
    let data = {};
    data.user = userName;
    data.status = status;
    request('/admin/u/user', data, 'PUT', (response) => {
        if (response.status == 'success') {
            loadUsers();
        }
    }, true);
}

function searchUser(){
    let data = {};
    data.user = $('#searchUserInput').val();
    request('/admin/u/user/search', data, 'GET', (response) => {
        if (response.status == 'success') {
            let users = response.data;
            console.log(users);
            resnderUsers(users);
        }
    }, true);
}

function updateTaskFrequency(){
    $('#taskEditSubmitBtn').addClass('disabled');
    let data = {};
    data.name = $('#editTask-name').html().split(':')[1].trim();
    data.frequency = $('#editTask-value').html();
    console.log(data);
    request('/admin/u/task', data, 'PUT', (response) => {
        if (response.status == 'success') {
            loadTasks(false);
            $('#taskEditrespDiv').html(response.data);
        } else {
            $('#taskEditrespDiv').html(response.error);
        }
        setTimeout(()=>{
            $('#taskEditrespDiv').html('');
        },5000);
        $('#taskEditSubmitBtn').removeClass('disabled');
    }, true);
}

function updateTaskStatus(name , status){
    let data = {};
    data.name = name;
    data.status = status;
    request('/admin/u/task', data, 'PUT', (response) => {
        if (response.status == 'success') {
            loadTasks(false);
        }
    }, true);
}