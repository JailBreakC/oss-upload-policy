var path = require('path');
var express = require('express');
var app = express();
var router = express.Router();
var policy = require('./lib');
app.set('port', 80);

var cors = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //console.log(req.user);
    next();
};

router.route('/policy')
	.post(policy.policy)
	.get(policy.policy);

app.use('/test', express.static(path.join(__dirname, './test')));
app.use(cors);
app.use(router);

var server = app.listen(app.get('port'), function() {
    console.log('## MT-NODE: listening on port ' + server.address().port + ',' + new Date());
});