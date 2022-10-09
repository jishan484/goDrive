const fs = require('fs');
const stream = require('stream');
let drive = require('../service/driveService');

class wpp extends stream.PassThrough{
    constructor(nu) {
        super({
            objectMode: true,
            highWaterMark: 1,
            readableHighWaterMark: 1
});
        this.n = nu;
        this.body = {
            fileSize:15,
            fileName:'a'+nu+'.txt',
            mimetype:'text/plain'
        }
        this.headers = {
            'content-length':200
        }
    }
}

class tpp extends stream.Transform {

    constructor(sampleFormat) {
        super({
            objectMode: true,
            highWaterMark: 1,
            readableHighWaterMark:1
        });
        this.size = 0;
        this.count = 0;
    }

    _transform(chunk, encoding, callback) {
        if(this.size <= (8*19) && this.count > 0){
            this.push(chunk);
            callback();
        }else{
            if (this.streamW) {
                this.streamW.end()
            }
            this.streamW = new wpp(this.count + '=');
            this.pipe(this.streamW);
            let res = drive.uploadFile(this.streamW,(status)=>{
                console.log(status)
            });
            this.count++;
            this.push(chunk);
            this.size = chunk.length;
            callback();
        }
        if(chunk) this.size+=chunk.length;        
    }
}
let a = new tpp();
setTimeout(()=>{
    fs.createReadStream(__dirname + '/cred.json', { highWaterMark: 8 }).pipe(a);
},6000);
a.on('end',()=>{
    console.log('end');
});

a.on('finish',()=>{
    console.log('finish');
})