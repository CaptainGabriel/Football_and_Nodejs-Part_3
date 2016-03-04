'use strict';

//node.js modules
const path = require('path');

//express stuff related
const express = require('express');
const app = exports.app = express();
const bodyParser = require('body-parser');

const handlebarsHelperMethods = require('./utils/helpers');
const handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: handlebarsHelperMethods
});

const cookieParser = require('cookie-parser');
const session = require('express-session');

//routing
const leaguesRouter = require('./routes/leagues');
const groupsRouter = require('./routes/groups');
const accountRouter = require('./routes/account');
const profileRouter = require('./routes/profile');
const usersRouter = require('./routes/users');

//if its not defined, we take 3000
const port = process.env.PORT || 3000;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(session({
    secret: 'something_secret_goes_here',
    saveUninitialized: false,
    resave: false,
    name: "SLB_1-FCP_2"
}));

//config passport.js inside this file
require('./config/passport')(app);

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(function(req, res, next) {
    console.log('%s %s — %s', (new Date()).toString(), req.method, req.url);
    req.user && console.log("Logged in as", req.user.username);
    return next();
});

app.get('/', function(req, res) {
    let context = {
        title: 'PI - ISEL - 15/16',
        description: 'Projeto nº 3 de PI realizado pelo grupo 1',
        author: 'Pedro Gabriel (38209) e Henrique Calhó (38245)',
        user: req.user
    };
    res.render('index_layout.handlebars', context);
});

app.use('/leagues', leaguesRouter);
app.use('/groups', groupsRouter);
app.use('/account', accountRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    let statusCode = err.status || 500;
    res.status(statusCode);
    res.render('404.handlebars', {
        "use404Styles": true,
        "statusCode": statusCode,
        "title": err.message
    });
});

app.listen(port, (err) => {
    if (err) {
        throw err;
    }
    console.log("Listening at port " + port);
});