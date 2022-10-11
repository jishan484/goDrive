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


class ChunkUploader {

    constructor(nodes, initCallback) {
        this.size = nodes.length;
        this.count = 0;
        this.isCancelled = false;
        this.nodes = nodes;
        this.streamObj = new CustomeStream();
        this.fetchFile(0);
        initCallback(true,this.streamObj);
    }

    fetchFile(index){
        if(this.count >= this.size) return;
        this.nodes[index].drive.readFile(this.nodes[index].nodeId,(status, data)=>{
            if(status){
                if(this.count < this.size-1)
                     data.pipe(this.streamObj, { end: false });
                else data.pipe(this.streamObj, { end: true });
                this.count++;
                this.fetchFile(this.count);
            } else {
                // not decided : error handling if drive throws error
            }
        })
    }

}


module.exports = ChunkUploader;