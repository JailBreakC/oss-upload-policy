var path = require('path');
var express = require('express');
var app = express();
var router = express.Router();
var policy = require('./lib');
app.set('port', 8080);

router.route('/policy')
	.post(policy.policy)
	.get(policy.policy);

app.use('/test', express.static(path.join(__dirname, './test')));
app.use(router);

var server = app.listen(app.get('port'), function() {
    console.log('## MT-NODE: listening on port ' + server.address().port + ',' + new Date());
});