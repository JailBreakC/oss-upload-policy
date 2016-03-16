var KEY = require('../../key');
var Base64 = require('../utils/base64');
var Crypto = require('../utils/crypto');
var moment = require('moment');
module.exports = {
    policy: function (req, res) {

        var MAX_FILE_SIZE = 10 * 1024 * 1000; //3MB
        var TIME = moment().utc().add(8, 'hours').add(30, 'minutes').format("YYYY-MM-DD[T]hh:mm:ss[.000Z]");//30分钟过期

        var accessid= KEY.AK;
        var accesskey= KEY.SK;
        var host = 'http://' + KEY.BUCKET + '.' + KEY.LOCATION + '.aliyuncs.com';

        var policyText = {
            "expiration": TIME, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
            "conditions": [
                ["content-length-range", 0, MAX_FILE_SIZE] // 设置上传文件的大小限制
            ]
        };

        
        var policyBase64 = Base64.encode(JSON.stringify(policyText))
        var message = policyBase64
        var bytes = Crypto.HMAC(Crypto.SHA1, message, accesskey, { asBytes: true }) ;
        var signature = Crypto.util.bytesToBase64(bytes);

        var policy = {
            policyBase64: policyBase64,
            accessid: accessid,
            signature: signature,
            host: host
        }
        res.json({
            flag: true,
            policy: policy
        });
    }
};