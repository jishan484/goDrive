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