const log = require("../logService");
const db = require("../../database");
const userService = require("./../userService");
const { appConfig } = require("../../SystemConfig.js")

class AppControlService {
    constructor() {
        log.log('debug', 'Mail service initialized!');
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    get(data, callback){
        let user = data.user;
        db.get('SELECT * FROM Mails WHERE targetUser = ?', [user], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                if (row == undefined) callback(false);
                else callback(row);
            }
        });
    }


    // -------------------------------------UTILITY--------------------------------------------//

    getMails(req, callback){
        let data = {};
        data.user = userService.getUserName(req.cookies.seid);

        let unseenMailsFilter = req.body.unseenFilter;
        let mailType = req.body.type;
        unseenMailsFilter = (unseenMailsFilter == undefined) ? false : unseenMailsFilter;
        mailType = (mailType == undefined)? false : mailType;

        this.get(data,(results)=>{
            let res = []
            results.forEach(result => {
                // if filter is not provided then return all mails
                if((!unseenMailsFilter || result.status == unseenMailsFilter)
                && (!mailType || result.type == mailType)) {
                    let mail = {};
                    mail.from = result.userName;
                    mail.message = result.message;
                    mail.time = result.createdOn;
                    res.push(mail);
                }
            });
            if(res.length == 0){
                callback(false, 'No mail found for you!');
                return;
            }
            callback(true, res);
        })
    }

    saveMail(req, callback){
        
    }
}


module.exports = new AppControlService();