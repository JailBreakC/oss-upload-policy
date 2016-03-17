var express = require('express');
var router = express.Router();
var policy = require('./module/policy');
var message = require('./module/message');


router.route('/policy')
	.all(policy.policy);

router.route('/msg')
	.get(message.gets)
	.post(message.add)
	.delete(message.del);

router.route('/mylocation')
	.get(message.getLocation);

// router.route('/restore')
// 	.get(message.restore);


module.exports = function(app) {
	
	app.use(router);

};