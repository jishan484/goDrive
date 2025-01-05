const log = require("../logService/index.js");
const fs = require('fs');
const path = require('path');
const UserService = require('../userService/index.js');

class InstallationService {
    constructor() {
        log.log('debug', 'Installation service initialized!');
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    // -------------------------------------UTILITY--------------------------------------------//

    getInstallationStatus(callback) {
        if (fs.existsSync(path.resolve('resources/installerInfo.mifi'))) {
            let installerInfo = fs.readFileSync(path.resolve('resources/installerInfo.mifi'));
            callback(true, JSON.parse(installerInfo));
        } else {
            callback(false, null);
        }
    }

    check() {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(path.resolve('resources/installerInfo.mifi'))) {
                reject();
            } else {
                resolve();
            }
        });
    }

    updateInstallationStatus(data, step, onCompleteTask, callback) {
        if (fs.existsSync(path.resolve('resources/installerInfo.mifi'))) {
            let installerInfo = JSON.parse(fs.readFileSync(path.resolve('resources/installerInfo.mifi')));
            installerInfo[step] = true;            
            fs.writeFileSync(path.resolve('resources/installerInfo.mifi'), JSON.stringify(installerInfo));
            this.processStep(step, data, callback);
            if (step === 'step3') {
                fs.unlinkSync(path.resolve('resources/installerInfo.mifi'));
                onCompleteTask();
            }
        } else {
            callback(false);
        }
    }

    processStep(step, data, callback) {
        if (step === 'step1') {
            this.processStep1(data, callback);
        } else if (step === 'step2') {
            this.processStep2(data, callback);
        } else if (step === 'step3') {
            this.processStep3(data, callback);
        }
    }

    processStep1(data, callback) {
        if (data) {
            let systemConfig = require('../../SystemConfig.js');
            systemConfig.DatabaseConfig.databaseType = data.databaseType;
            systemConfig.DatabaseConfig.host = data.databaseHost;
            systemConfig.DatabaseConfig.databaseName = data.databaseName;
            systemConfig.DatabaseConfig.userName = data.databaseUser;
            systemConfig.DatabaseConfig.password = data.databasePassword;
            systemConfig.DatabaseConfig.port = data.databaseType === 'mysql' ? 3306 : 5432;

            let filedata = fs.readFileSync(path.resolve('SystemConfig.js')).toString();
            filedata = filedata.replace(/const\s+DatabaseConfig\s*=\s*{[^}]*}/, 'const DatabaseConfig = ' + JSON.stringify(systemConfig.DatabaseConfig,null, 2));
            filedata = filedata.replace(/adminEmail.*/, "adminEmail: '"+data.adminEmail+"'");
            fs.writeFileSync(path.resolve('SystemConfig.js'), filedata);

            let adminAccountCreationQuery = `
            module.exports = {
                version: '1.0.0',
                QueryId: 'Admin_account_001',  // Unique ID for every changes
                comment: '[DBinit-LOG] Admin account createion',
                query:
                    \`INSERT INTO Users 
                    (userName, password, accessToken, role, createdOn, profile)
                    VALUES ('${data.adminName}', '${UserService.getEncryptedPassword(data.adminPassword)}', 'super_admin_token', 'super_admin', CURRENT_TIMESTAMP, '')\`,
            }
            `;
            fs.writeFileSync(path.resolve('database/DBschema/adminAccount.js'), adminAccountCreationQuery);
            callback(true);
        } else {
            callback(false,'No valid data provided');
        }
    }

    processStep2(data, callback) {
        if (data) {
            if(data.skipped == undefined) {
                if(data.driveType == "Google Drive" && data.googleDriveToken == undefined){
                    callback(false, "Invalid Token");
                } else if(data.driveType == "Google Drive" && data.googleDriveToken != undefined && data.googleDriveToken != '') {
                    fs.writeFileSync(path.resolve("CREDENTIALS/google.json"),data.googleDriveToken);
                } else {
                    callback(false, "No setup process avilable now. Please skip for now");
                }
            } else {
                callback(true);
            }
        } else {
            callback(false,'No valid data provided');
        }
    }

    processStep3(data, callback) {
        if (data) {
            if(data.activateWebDAV != undefined && data.activateWebDAV == 'Yes') {
                let filedata = fs.readFileSync(path.resolve('SystemConfig.js')).toString();
                filedata = filedata.replace(/webDAVServer.*/, "webDAVServer: true,");
                fs.writeFileSync(path.resolve('SystemConfig.js'), filedata);
            } else {
                let filedata = fs.readFileSync(path.resolve('SystemConfig.js')).toString();
                filedata = filedata.replace(/webDAVServer.*/, "webDAVServer: false,");
                fs.writeFileSync(path.resolve('SystemConfig.js'), filedata);
            }
            callback(true);
        } else {
            callback(false,'No valid data provided');
        }
    }
}

module.exports = new InstallationService();