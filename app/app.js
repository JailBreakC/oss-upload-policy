var path = require('path');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var CONFIG = require('./config');

var mongoose = require('mongoose');

var confDatabase = function () {

    // 设置数据库 - MONGOOSE CONFIG
    // console.log(CONFIG);
    var connect = function () {
        mongoose.connect(CONFIG.database.url, CONFIG.database.options);
    };
    connect();

    // MOOGOOSE EVENT
    // mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.on('error', console.log);
    mongoose.connection.on('disconnected', connect);
    mongoose.connection.once('open', function () {
        console.log('## NODE: Initialize database with Mongoose.');
    });
};

var initServer = function() {

	app.set('port', 8888);

	var cors = function(req, res, next) {
	    res.header("Access-Control-Allow-Origin", "*");
	    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    next();
	};

	app.use('/test', express.static(path.join(__dirname, '../test')));
	app.use(cors);

	var server = app.listen(app.get('port'), function() {
	    console.log('## NODE: listening on port ' + server.address().port + ',' + new Date());
	});
	
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


confDatabase();
initServer();

require('./router')(app);

module.exports = app;