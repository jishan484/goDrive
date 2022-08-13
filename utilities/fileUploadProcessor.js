const events = require('events');
const Drive = require('./drive.js');

class Processor extends events.EventEmitter {
    constructor(name) {
        super();

        this.fileName = name;
        this.drive = null;
        this.on('pipe', function (data) {
            this.drive = new Drive();
        });
    }

    write(data) {
        // write data after encoding
        this.drive.writeFile('jishan.png', data);
    }

    end() {
        // close all connections
        console.log('end');
    }
}


module.exports.FileProcessor = Processor;
