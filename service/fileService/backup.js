const stream = require('stream');
const log = require('../logService');
const driveService = require('../driveService');
let count = 0;
class MultiPartUploader extends stream.Transform {
    constructor(drivesConfig, reqBody, completeCallback) {
        super({});
        this.boundery = '';
    }

    // transform a multipart request into a stream of chunks
    // and separate all the files into different streams
    _transform(chunk, encoding, callback) {
        // console.log('chunk', chunk.length);
        // devide the chunk into files
        this.readFirstChunk(chunk, encoding, callback);
    }
    readChunk(chunk, encoding, callback) {
        // read the chunk
        let i = 0;
        let j = 0;
        let count = 0;
        while (i < chunk.length) {
            if (chunk[i] == 10) {
                let data = chunk.slice(j, i + 1);
                j = i + 1;
                console.log(data.toString());
                console.log('found boundery');
                count++;
                if (count > 14) {
                    console.log(count);
                    this.readFirstChunk = () => { };
                    break;
                }
            }
            i++;
        }
        // console.log(chunk.toString());
        callback();
    }
    readFirstChunk(chunk, encoding, callback) {
        this.readBoundary(chunk);
        this.readFirstChunk = this.readChunk;
        this.readChunk(chunk, encoding, callback);
    }
    readBoundary(chunk, encoding, callback) {
        this.boundery = chunk.toString().split('\r\n')[0];
        // convert boundery to buffer
        // console.log(chunk.toString().split('\r\n'));
        this.boundery = Buffer.from(this.boundery);
    }

}

module.exports = MultiPartUploader;