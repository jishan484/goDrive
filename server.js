const express = require('express');
const cookieParser = require('cookie-parser');
const userService = require('./service/userService')
const app = express();
const port = process.env.PORT | 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    if(req.url.search('portal') == -1){
        res.set('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
    }
    res.header("X-Powered-By", "MiFi-Server");
    next();
});

app.use('/', express.static('public'));

app.get('/', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store');
    if (userService.isLoggedIn(req)) {
        res.redirect('/home');
    } else {
        res.sendFile(__dirname + '/views/login.html');
    }
});
app.get('/home', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store');
    if (userService.isLoggedIn(req)) {
        res.sendFile(__dirname + '/views/home.html');
    } else {
        res.redirect('/');
    }
});

app.use('/portal', require('./controller/portal'));
// app.use('/app', require('./routes/users'))


app.get('*', (req, res) => res.send('Oh! where you are going ? Stay true to your path.'));

app.listen(port, () => {
    console.log('Server Started!\nlistening on port 0.0.0.0:'+port);
});
