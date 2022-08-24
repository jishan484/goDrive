/**
 @constructor
 @abstract
 */
module.exports = class Storage{
    constructor(storageType){
        this.storageType = storageType;
        this.displayName = "";
        this.storageInfo = {};
        this.freeSpace = 0;
    }

    // prepare the storage for use and get the drive info
    setup(callback){
        throw new Error("[SERROR] Abstract method! : setup :");
    }

    // get the particular file from the storage
    readFile(fileIdOrName, callback){
        throw new Error("[SERROR] Abstract method! : readFile");
    }

    // write the file to the storage
    writeFile(fileName, mimeType, fileData, callback){
        throw new Error("[SERROR] Abstract method! : writeFile");
    }

    // remove the file from the storage | permanently
    deleteFile(fileIdOrName, callback){
        throw new Error("[SERROR] Abstract method! : deleteFile");
    }

    // returns a object with the following properties: {displayName, storageInfo, freeSpace}
    getInfo(callback){
        throw new Error("[SERROR] Abstract method! : getInfo");
    }
}