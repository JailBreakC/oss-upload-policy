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
        var page = req.query.page - 0 || 1;
        var count = req.query.count - 0 || 5;

        MessageModel.safeFind({
            page,
            count
        },function(err, result, total) {
            if(err) {
                res.json({
                    flag: false,
                    systemErr: err
                });
                return;
            }

            res.json({
                flag: true,
                navigator: {
                    page: page,
                    count: count > total ? total : count,
                    total: total
                },
                data: result
            });
        })
    },
    del: function(req, res) {
        var mids = req.body.ids;
        mids = mids.split(',')
        MessageModel.remove({
            _id: mids
        }, function (err, release) {
            if (err) {
                console.log(err);
                res.json({
                    flag: false,
                    err: '删除失败'
                })
                return;
            }
             res.json({
                flag: true,
                data: '删除成功'
            })
        });
    },
    getLocation: function(req, res) {
        function getClientIp(req) {
            return (req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress).split(':').pop();
        };

        var ip = getClientIp(req);
        console.log(ip);
        request.get(taobaoIP)
            .query({
                ip: ip
            })
            .end(function(err, getReq) {
                var body = JSON.parse(getReq.text);
                if(err) {
                    res.json({
                        flag: false,
                        error: 'ip服务错误'
                    })
                    return;
                }
                res.json({
                    flag: true,
                    data: {
                        'location': body.data
                    }
                })
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