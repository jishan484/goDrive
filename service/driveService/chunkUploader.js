// This service is called if there is no single drive could hold full file.
// This service devides the file and uploads in multiple drives.
const stream = require('stream');
const log = require('../logService');

class CustomeStream extends stream.PassThrough {
    constructor() {
        super({
            objectMode: true,
            highWaterMark: 1,
            readableHighWaterMark: 1
        });
    }
}


class ChunkUploader extends stream.Transform {

    constructor(drivesConfig,reqBody, completeCallback) {
        super({
            objectMode: true,
            highWaterMark: 1,
            readableHighWaterMark: 1
        });
        this.size = 0;
        this.count = 0;
        this.body = reqBody;
        this.isCancelled = false;
        this.configs = drivesConfig;
        this.streamObj = null;
        this.trackUploads={
            completed:0,
            isFailed:false,
            isCompleted:false,
            callback:completeCallback,
            responses:[]
        };
    }

    _transform(chunk, encoding, callback) {
        if(this.size <= this.configs[0].size && this.count > 0){
            this.push(chunk);
            callback();
        } else {
            if(this.streamObj){
                this.streamObj.end();
                this.unpipe(this.streamObj);
                this.streamObj = null;
            }
            this.streamObj = new CustomeStream();
            // drives will be called here
            this.pipe(this.streamObj);
            this.configs[this.count].drive.drive.writeFile(this.body.fileName+'.PART_'+this.count, this.body.mimetype, this.streamObj, (status, response) =>{
                if (status) {
                    let currentCallbackIndex = response.name.split('.PART_')[1];
                    this.configs[currentCallbackIndex].drive.update(parseInt(response.size));
                    response.driveIndex = currentCallbackIndex;
                    response.driveId = this.configs[currentCallbackIndex].drive.id;

                    if (this.isCancelled == true) {
                        //delete files of current callbacks
                        this.deleteUploadedFileParts(response);
                        return;
                    }
                    if (this.trackUploads.completed >= this.configs.length - 1) {
                        this.trackUploads.isCompleted = true;
                        this.trackUploads.responses.push(response);
                        this.trackUploads.callback(!this.trackUploads.isFailed, this.trackUploads.responses);
                    } else {
                        this.trackUploads.completed++;
                        this.trackUploads.responses.push(response);
                    }
                } else {
                    this.trackUploads.isFailed = true;
                }
            });
            // call the callback also
            this.count++;
            this.push(chunk);
            this.size = 0;
            callback();
        }
        if (chunk) this.size += chunk.length; 
    }

    clearUploads(){
        this.isCancelled = true;
        //delete already completed uploads : also have to check for other pending callbacks
        if (this.trackUploads.completed > 0){
            for(let i=0;i<this.trackUploads.responses.length;i++){
                this.deleteUploadedFileParts(this.trackUploads.responses[i]);
            }
        }
        this.trackUploads.callback(false, this.trackUploads.responses);
    }

    deleteUploadedFileParts(response){
        this.configs[response.driveIndex].drive.drive.deleteFile(response.id, (status, resp) => {
            if (status){
                this.configs[response.driveIndex].drive.update(parseInt(response.size) * -1);
            }
            else{
                log.error(resp);
            }
        });
    }

}


module.exports = ChunkUploader;