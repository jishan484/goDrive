/*
* Author : jishan
* update : none
* version : 01.01 [major . minor]
*/

var currentPage = 1;
var refresh_frequency = 20000; //20 seconds
var mailTray;
var mailViewer;


class MailsTray {
    hasError = "";
    totalMail;
    totalPage;
    static lastUpdated;
    constructor() {
        this.mailId = "";
        this.fromNameLogoText = "";
        this.fromAddress = "";
        this.mailSubject = "";
        this.mailDate = "";
        this.mailTime = "";
        this.mailStatus = "";
        this.totalMail = "";
        this.totalPage = "";
        this.currentPage = 0;
    }
    setCount(total){
        this.totalMail = total;
        this.totalPage = parseInt(total/50);
        this.currentPage = 1;
    }
    setData(mail) {
        let dt = mail.time.split(" ");
        let date = dt[2] + "-" + dt[1] + "-" + dt[5];
        this.mailId = mail.id;
        this.fromNameLogoText = mail.from[0] + mail.from[1];
        this.fromAddress = mail.from;
        this.mailSubject = mail.subject;
        this.mailDate = date;
        this.mailTime = dt[3];
        this.mailStatus = mail.status;
    }
    renderHTML() {
        let style = "style='background:"+random_rgb(120)+"';";
        let finalHTML = "";
        // checking for empty/unset variables : continue rendering dont stop after error
        if (this.#checkError() != "") console.error("error : \n", this.hasError);
        if (this.mailStatus == "unseen")
            finalHTML = '<div class="mail_container mail_unseen">'
        else
            finalHTML = '<div class="mail_container">'
        finalHTML +=
                `<div class="mail_sender_logo" `+style+`>`+this.fromNameLogoText+`</div>
                <div class="mail_content" onclick="openMail('`+this.mailId+`')">
                    <div class="mail_sender_address">`+ this.fromAddress + `</div>
                    <div class="mail_subject">`+ this.mailSubject + `</div>
                </div>
                <div class="mail_details">
                    <div class="mail_date">`+ this.mailDate + `</div>
                    <div class="mail_time">`+ this.mailTime + `</div>
                </div>
                <div class="mail_action">
                    <div class="mail_action_button">
                        <img src="resources/image/reply_mail.png">
                        <span>Replay</span>
                    </div>
                    <div class="mail_action_button">
                        <img src="resources/image/forward_mail.png">
                        <span>Forward</span>
                    </div>
                    <div class="mail_action_button">
                        <img src="resources/image/delete_mail.png">
                        <span>Delete</span>
                    </div>
                </div>
            </div>`;
        return finalHTML;
    }
    #checkError() {
        this.mailId == "" ? this.hasError += "\t\tMail Id is required\n" : null;
        this.fromNameLogoText == "" ? this.hasError += "\t\tFrom Name Logo Text is required\n" : null;
        this.fromAddress == "" ? this.hasError += "\t\tFrom Address is required\n" : null;
        this.mailSubject == "" ? this.hasError += "\t\tMail Subject is required\n" : null;
        this.mailDate == "" ? this.hasError += "\t\tMail Date is required\n" : null;
        this.mailTime == "" ? this.hasError += "\t\tMail Time is required\n" : null;
        this.mailStatus == "" ? this.mailStatus="unseen" : null;
        return this.hasError;
    }
    
    renderHeaderHTML(){
        //todo : calc part 
        let a = 
        `<div class="content_header">
            <button id="mail_action_refresh" onclick="refresh_mail()">Refresh</button>
            <div class="action_page">
                <button id="page_prev" class="deactive"><</button>
                <div id="page_count">`+this.currentPage+` of `+this.totalPage+`</div>
                <button id="page_next">></button>
            </div>
            <div id="mail_count">1-50 of `+this.totalMail+` mails</div>
        </div>
        <div class="content" id="content">

        </div>`;
        return a;
    }
    updateHeader(div , currentPage){
        this.currentpage = currentPage;
    }
}

class MailViewer{
    constructor(){
        this.mailId = "";
        this.fromNameLogoText = "";
        this.fromAddress = "";
        this.mailSubject = "";
        this.mailDate = "";
        this.mailTime = "";
        this.mailStatus = "";
        this.mailText = "";
        this.mailCC = "";
    }
    setData(data){
        let dt = data.time.split(" ");
        let date = dt[2] + "-" + dt[1] + "-" + dt[5];

        this.mailId = data.id;
        this.fromNameLogoText = data.from[0]+data.from[1];
        this.fromAddress = data.from;
        this.mailSubject = data.subject;
        this.mailDate = date;
        this.mailTime = dt[3];
        this.mailText = data.text;
        this.mailCC = data.cc == ""? "":"cc : "+data.cc;
    }
    renderHTML(){
        let html = 
        `<div class="mail_viewer">
            <div class="header">
                <button onclick="backToMailInfo()">back</button>
                <div class="mail_action">
                    <div class="mail_action_button">
                        <img src="resources/image/reply_mail.png">
                        <span>Replay</span>
                    </div>
                    <div class="mail_action_button">
                        <img src="resources/image/forward_mail.png">
                        <span>Forward</span>
                    </div>
                    <div class="mail_action_button">
                        <img src="resources/image/delete_mail.png">
                        <span>Delete</span>
                    </div>
                </div>
            </div>
                <div class="viewer_header">
                    <div class="mailer_logo">`+this.fromNameLogoText+`</div>
                    <div class="mailer_address">`+this.fromAddress+`</div>
                    <div class="mail_subject">`+this.mailSubject+`</div>
                    <div class="mail_date">`+this.mailDate+`</div>
                    <div class="mail_time">`+this.mailTime+`</div>
                </div>
                <div class="mail_cc">`+this.mailCC+`</div>
                <div class="viewer">
                    `+this.mailText+`
                </div>
            </div>
        </div>`;
        return html;
    }
}
function random_rgb(contrust) {
    var o = Math.round, r = Math.random, s = (contrust==null)?255:contrust;
    return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
}

function loader_animation() {
    container.innerHTML = "";
    let number_of_circle = 5;
    let loader_html = "<div class='loader'>";
    for (let i = 0; i < (number_of_circle * number_of_circle); i++) {
        let random_color = random_rgb();
        let random_time = Math.random() * 4 + 1;
        let style = "\"background:" + random_color + ";animation:loader " + random_time + "s infinite;\"";
        loader_html += "<div class='loader_circle' style=" + style + "></div>";
    }
    loader_html += "</div>"
    container.innerHTML = loader_html;
}

function comp(x, y) {
    if (parseInt(x.id) < parseInt(y.id)) return 1;
    return -1;
}


//init global variables
mailTray = new MailsTray();
mailViewer = new MailViewer();