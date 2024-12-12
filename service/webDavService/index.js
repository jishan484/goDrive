const path = require("path");
const log = require("./../logService");
const mimeTypes = require("./mimeTypes");
const fileService = require("./../fileService");
const userService = require("./../userService");
const folderService = require("./../folderService");
const { externalAPIConfig } = require("./../../SystemConfig");

class WebDAVProcessor {
  constructor() {
    log.log("debug", "WebDAV service initialized!");
  }

  handleOptions(req, res) {
    res.status(200).send();
  }

  handlePropfind(req, res) {
    // if(!req.body.toString().includes('<?xml version="1.0" encoding="utf-8"?>')){
    //   res.status(400).send("invaliad prop request").end();
    //   return;
    // }
    let depthHeader = req.headers["depth"] || "0";
    let data = {};
    (data.body = {}), (data.cookies = {});
    if (req.originalUrl == "/") depthHeader = "0";
    data.body.folderPath =
      "/home" +
      (req.path.endsWith("/") || req.path.endsWith("\\")
        ? req.path.slice(0, -1)
        : req.path);
    data.body.filePath = decodeURIComponent(data.body.folderPath);
    data.body.folderPath = decodeURIComponent(data.body.folderPath);
    data.body.user = "jishan";
    data.cookies.seid = userService.getUserToken(data.body, "RemoteUser");
    folderService.getFolderTree(data, (status, result) => {
      if (status) {
        fileService.getFiles(data, (status, files) => {
          if (status) {
            result.files = files.files;
          }
          let xmlresult = this.generatePropfindResponse(result, depthHeader);
          res.set("Content-Type", "application/xml");
          res.status(207).send(xmlresult).end();
        });
      } else {
        data.fileName = path.basename(data.body.filePath);
        let result = {};
        fileService.getFile(data, (status, files) => {
          if (status) {
            result.files = files.files;
            let xmlresult = this.generatePropfindResponse(
              result,
              depthHeader,
              1
            );
            res.set("Content-Type", 'application/xml; charset="utf-8"');
            // res.set("Allow", "GET, PUT, DELETE, PROPFIND, MKCOL, OPTIONS");
            // res.set("Public", "GET, PUT, DELETE, PROPFIND, MKCOL, OPTIONS");
            // res.set({ 'Depth': '1', 'Content-Type': 'application/xml; charset=utf-8', 'Accept': 'application/xml'});
            res.status(207).send(xmlresult).end();
          } else res.status(404).end();
        });
      }
    });
  }

  /**
   * Handle GET - Download a file
   */
  handleGet(req, res) {
    req.connection.setNoDelay(true);
    res.connection.setNoDelay(true);
    let data = {};
    (data.body = {}), (data.cookies = {});
    data.body.filePath = "/home" + path.dirname(req.originalUrl).slice(7);
    data.body.fileName = decodeURIComponent(path.basename(req.originalUrl));
    data.body.user = "jishan";
    data.cookies.seid = userService.getUserToken(data.body, "RemoteUser");
    // data.isDAVParamProvided = true;
    fileService.downloadFile(data, (status, fileData) => {
      if (status) {
        res.set(
          "Content-Disposition",
          ' attachment; filename="' + data.body.fileName + '"'
        );
        res.set("Content-Length", data.body.fileSize);
        res.set("Content-Type", data.body.fileType);
        fileData._readableState.highWaterMark = 320000;
        fileData._writableState.highWaterMark = 320000;
        res.socket._readableState.highWaterMark = 320000;
        res.connection._readableState.highWaterMark = 320000;
        res.socket._writableState.highWaterMark = 320000;
        res.connection._writableState.highWaterMark = 320000;
        fileData.pipe(res);
        res.on("close", () => {
          fileData.unpipe();
          fileData.end();
        });
        res.on("finish", () => {
          fileData.unpipe();
          fileData.end();
        });
      } else {
        res.status(404).send(fileData).end();
      }
    });
  }

  /**
   * handle PROPPATCH
   **/
  handleProppatch(req, res) {
    res.status(200).send("ook").end();
    return;
    if (
      !req.body.toString().includes('<?xml version="1.0" encoding="utf-8"?>')
    ) {
      res.status(400).send("invalid prop request").end();
      return;
    }
    let data = {};
    (data.body = {}), (data.cookies = {});
    data.body.filePath = decodeURIComponent(req.body.filePath);
    data.body.user = "jishan";
    data.cookies.seid = userService.getUserToken(data.body, "RemoteUser");
    fileService.updateFileProperties(data, (status, result) => {
      if (status) {
        let xmlresult = `<?xml version="1.0" encoding="utf-8" ?>
                <D:multistatus xmlns:D="DAV:">
                    <D:response>
                        <D:href>${data.body.filePath}</D:href>
                        <D:propstat>
                            <D:status>HTTP/1.1 200 OK</D:status>
                            <D:prop>
                                <D:getlastmodified>${new Date().toUTCString()}</D:getlastmodified>
                                <D:getetag>"12345"</D:getetag>
                            </D:prop>
                        </D:propstat>
                    </D:response>
                </D:multistatus>`;
        res.set("Content-Type", "application/xml");
        res.status(207).send(xmlresult).end();
      } else {
        res.status(404).end();
      }
    });
  }

  /**
   * Handle PUT - Upload or overwrite a file
   */
  handlePut(req, res) {
    let data = {};
    data.body = {};
    data.cookies = {};
    data.body.fileName = path.basename(req.originalUrl);
    data.body.filePath = "/home" + path.dirname(req.originalUrl).slice(7);
    data.body.user = "jishan";
    data.cookies.seid = userService.getUserToken(data.body, "RemoteUser");
    //data for file
    data.body.fileType = req.headers["content-type"] != undefined ? req.headers["content-type"] : mimeTypes[data.body.fileName.split(".").pop().toLowerCase()];
    data.body.fileType = (data.body.fileType == undefined) ? 'application/octet-stream' : data.body.fileType;
    data.body.fileSize =
      req.headers["content-length"] != undefined
        ? req.headers["content-length"]
        : "0";
    req.body = data.body;
    req.cookies = data.cookies;
    req.body.overwrite = true;
    fileService.uploadFile(req, (status, resp) => {
      if (status) res.status(200).send(resp).end();
      else res.status(404).send(resp).end();
    });
  }
  
  handleHead(req, res) {
    let data = {};
    data.body = {};
    data.cookies = {};
    data.body.filePath = "/home" + req.originalUrl.slice(7);
    data.body.user = "jishan";
    data.cookies.seid = userService.getUserToken(data.body, "RemoteUser");
    req.body = data.body;
    req.cookies = data.cookies;
    // res.status(204).end();
    fileService.getFile(req, (status, resp) => {
      if (status){
        res.set({
          "content-length":resp.files[0].fileSize,"content-type":resp.files[0].fileType
        });
        res.status(200).end();
      }
      else res.status(404).end();
    });
  }

  /**
   * Handle DELETE - Delete a resource
   */
  handleDelete(req, res) {
    let data = {};
    data.body = {};
    data.cookies = {};
    data.body.folderName = path.basename(req.originalUrl);
    data.body.folderPath = "/home" + path.dirname(req.originalUrl).slice(7);
    data.body.user = "jishan";
    data.cookies.seid = userService.getUserToken(data.body, "RemoteUser");
    folderService.deleteFolder(data, (status, resp) => {
      if (status) res.status(200).end();
      else{
        data.body.filePath = data.body.folderPath;
        data.body.fileName = data.body.folderName;
        fileService.deleteFile(data,(status,resp)=>{
          if(status) res.status(200).end();
          else res.status(400).end();
        })
      }
    });
  }

  /**
   * Handle MKCOL - Create a directory
   */
  handleMkcol(req, res) {
    let data = {};
    data.body = {};
    data.cookies = {};
    data.body.folderName = path.basename(req.originalUrl);
    data.body.folderPath = "/home" + path.dirname(req.originalUrl).slice(7);
    data.body.user = "jishan";
    data.cookies.seid = userService.getUserToken(data.body, "RemoteUser");
    folderService.createFolder(data, (status, data) => {
      if (status) res.status(200).send(data).end();
      else res.status(200).send(data).end();
    });
  }

  /**
   * Generate XML response for PROPFIND
   */
  generatePropfindResponse(files, depth, isOnlyFile = 0) {
    let responseXML = `<?xml version="1.0" encoding="utf-8" ?>
    <D:multistatus xmlns:D="DAV:">`;

    if (depth == "0") {
      if (!isOnlyFile) responseXML += this.propFindresponseBody(files);
      else
        files.files.forEach((file) => {
          responseXML += this.propFindresponseBodyFiles(file);
        });
    } else {
      if(!isOnlyFile){
        responseXML += this.propFindresponseBody(files);
        files.subFolders.forEach((file) => {
          responseXML += this.propFindresponseBody(file);
        });
      }
      if (files.files != undefined)
        files.files.forEach((file) => {
          responseXML += this.propFindresponseBodyFiles(file);
        });
    }

    responseXML += `</D:multistatus>`;
    return responseXML;
  }
  propFindresponseBodyFiles(file) {
    if (file == undefined) return;
    return `
<D:response>
    <D:href>${file.filePath.replace("/home", "/remote") + "/" + file.fileName}</D:href>
    <D:propstat>
        <D:status>HTTP/1.1 200 OK</D:status>
        <D:prop>
            <D:creationdate>${new Date(
              file.modifiedOn
            ).toUTCString()}</D:creationdate>
            <D:displayname>${file.fileName}</D:displayname>
            <D:getcontentlength>${file.fileSize}</D:getcontentlength>
            <D:getcontenttype>${file.fileType}</D:getcontenttype>
            <D:getetag>"12345"</D:getetag>
            <D:getlastmodified>${new Date(
              file.modifiedOn
            ).toUTCString()}</D:getlastmodified>
            <D:resourcetype></D:resourcetype>
        </D:prop>
    </D:propstat>
</D:response>
`;
  }
  propFindresponseBody(file) {
    if (file == undefined) return;
    return `
<D:response>
	<D:href>${file.fullPath.replace("/home", "/remote")}</D:href>
	<D:propstat>
		<D:status>HTTP/1.1 200 OK</D:status>
		<D:prop>
			<D:getcontenttype/>
			<D:getlastmodified>${new Date(file.createdOn).toUTCString()}</D:getlastmodified>
			<D:lockdiscovery/>
			<D:ishidden>0</D:ishidden>
			<D:supportedlock>
				<D:lockentry>
					<D:lockscope>
						<D:exclusive/>
					</D:lockscope>
					<D:locktype>
						<D:write/>
					</D:locktype>
				</D:lockentry>
				<D:lockentry>
					<D:lockscope>
						<D:shared/>
					</D:lockscope>
					<D:locktype>
						<D:write/>
					</D:locktype>
				</D:lockentry>
			</D:supportedlock>
			<D:getetag/>
			<D:displayname>${file.folderName}</D:displayname>
			<D:getcontentlanguage/>
			<D:getcontentlength>0</D:getcontentlength>
			<D:iscollection>1</D:iscollection>
			<D:creationdate>${new Date(file.createdOn).toUTCString()}</D:creationdate>
			<D:resourcetype>
				<D:collection/>
			</D:resourcetype>
		</D:prop>
	</D:propstat>
</D:response>
`;
  }
}

module.exports = new WebDAVProcessor();