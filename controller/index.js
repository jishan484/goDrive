const express = require('express');
const cookieParser = require('cookie-parser');
const {RouterConfig} = require("./../SystemConfig.js");
const path = require('path');
const app = express();
const port = process.env.PORT || RouterConfig.default_port;
const parser = express.json();


app.use((req,res,next)=> ignoreParsing(req) ? next() : parser(req, res, next))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    // if (req.url.search('/app/') == -1) {
    //     res.set('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
    // }
    res.header("X-Powered-By", "MiFi-Server");
    next();
});

app.use('/', express.static('resources/public'));

app.use('/', require('./pages'));
app.use('/app', require('./app'));
app.use('/admin', require('./admin'));
app.use('/external', require('./external'));
app.use('/remote', require('./webDav/index.js'));
app.propfind('/', require('./webDav/index.js'));
app.options('/', require('./webDav/index.js'));

const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
if (fs.existsSync("./swagger-output.json")) {
    const swaggerDocument = require("../swagger-output.json");
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.get('/image/format/*',(req,res)=>{
    res.sendFile(path.resolve('resources/public/image/format/app.svg'));
});
app.get('*', (req, res) => res.status(404).sendFile(path.resolve('resources/views/404.html')));

module.exports = server ={
    start: () => {
        let server = app.listen(port, () => {
            console.log(' [SLOG]   Server Started!\n [INFO]   Listening on 0.0.0.0:' + port);
        });
        server.timeout = 5000;
    },
    stop: () => {
        app.close(()=>{
            console.log(' [SLOG] Server closed' + Date.now());
        });
    }
}



// ================= middleware =============== //

function ignoreParsing(req){
    if(req.originalUrl == '/app/u/file' && req.method == 'POST') return true;
    return false;
}