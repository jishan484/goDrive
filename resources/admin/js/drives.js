var windowss = null;

function AddNewGDrive(){
    let payload = {
        type:'googleDrive',
        action:'add new',
        redirectURL: window.location.protocol + "//" + window.location.host
    };

    request("u/drive",payload,'POST',(response)=>{
        if(response.status == 'success'){
            let link = response.data;
            windowss = popupwindow(link, "Select Google Account",500,620);
        }
        else{
            alert("add drive request not accepted. Please check logs");
        }
    });

}

function popupwindow(url, title, w, h) {
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
} 