const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
// app.use('/external', require('./controller/external'))


app.get('*', (req, res) => res.send('Ooi! where you are going ? Stay true to your path.'));

module.exports = server ={
    start: () => {
        app.listen(port, () => {
            console.log('[SLOG] Server Started!\nlistening on port 0.0.0.0:' + port);
        });
    },
    stop: () => {
        app.close(()=>{
            console.log('[SLOG] Server closed' + Date.now());
        });
    }
}
