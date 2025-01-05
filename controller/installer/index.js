const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 8000;

let installationCompletiontask = ()=>{ console.log('[ERROR] No task assigned'); };

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    res.header("X-Powered-By", "MiFi-Server");
    req.onCompleteTask = installationCompletiontask;
    next();
});



app.use('/', express.static(path.resolve('resources/public')));

app.get('/', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store');
    res.sendFile(path.resolve('resources/views/install.html'));
});

app.use('/install', require('./installRoutes.js'));


app.get('/image/format/*', (req, res) => {
    res.sendFile(path.resolve('resources/public/image/format/app.svg'));
});
app.get('*', (req, res) => res.status(404).sendFile(path.resolve('resources/views/404.html'))); 

module.exports = server = {
    server: null,
    onComplete: (task)=>{ installationCompletiontask = task; },
    start: () => {
        this.server = app.listen(port, () => {
            console.log(' [SLOG]   Server Started!\n [INFO]   Listening on : ' + port);
        });
        this.server.timeout = 5000;
    },
    stop: () => {
        this.server.close(() => {
            console.log(' [SLOG] Server closed' + Date.now());
        });
    }
}