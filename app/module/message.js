var MessageModel = require('../model/message');
var request = require('superagent');

var fs = require('fs');
var path = require('path');
var taobaoIP = 'http://ip.taobao.com/service/getIpInfo.php'

module.exports = {
	add: function(req, res) {

        var data = req.body;

        console.log(data);

		var _message = new MessageModel(data);

		console.log(_message);
        _message.save(function (err) {
            if (err) {
            	console.log(err);
                res.json({
                	flag: false,
                	systemErr: err
               	});
                return;
            }
            res.json({
            	flag: true,
            	msg: 'success saved'
            });
        });
	},
	gets: function(req, res) {
		MessageModel.safeFind(function(err, result) {
			if(err) {
				res.json({
					flag: false,
					systemErr: err
				});
				return;
			}

			res.json({
				flag: true,
				data: result
			});
		})
	},
	restore: function(req, res) {

		var text = fs.readFileSync(path.join(__dirname,'../dd.csv'), "utf8");
		var textarr = text.split('\n');
		var data =[];
		for(var i = 0; i < textarr.length - 1; i++) {
			var deparr = textarr[i].split('');
			var dataObj = {};
			dataObj['id'] = deparr[0];
			dataObj['first'] = deparr[1];
			dataObj['sec'] = deparr[2];
			dataObj['author'] = deparr[3];
			dataObj['createdAt'] = new Date(deparr[4].replace('_', ' '));
			dataObj['deleted'] = deparr[5] == '0' ? false : true;
			dataObj['ip'] = deparr[6];
			dataObj['loc'] = deparr[7];
			dataObj['message'] = deparr[8];
			dataObj['weither'] = deparr[9];
			dataObj['city'] = deparr[10];
			dataObj['weither_icon'] = deparr[11];
			dataObj['img'] = deparr[12];
			data.push(dataObj);
			var _message = new MessageModel(dataObj);

	        _message.save(function (err) {
	            if (err) {
	            	console.log(err);
	            }
	        });
		}



		res.json(data);
		// console.log(data);

	}
}