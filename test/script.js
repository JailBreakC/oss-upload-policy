var guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var previewImage = function(file, callback){

    //确保文件是图片
    if(!file || !/image\//.test(file.type)) return; 

    //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
    if(file.type=='image/gif'){

        var fr = new mOxie.FileReader();
        fr.onload = function(){
            callback(fr.result);
            fr.destroy();
            fr = null;
        }

        fr.readAsDataURL(file.getSource());

    }else{

        var preloader = new mOxie.Image();

        preloader.onload = function() {
            preloader.downsize( 300, 300 );//先压缩一下要预览的图片,宽300，高300
            var imgsrc = preloader.type=='image/jpeg' ? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
            callback && callback(imgsrc); //callback传入的参数为预览图片的url
            preloader.destroy();
            preloader = null;
        };

        preloader.load( file.getSource() );
    }   
}


plupload.addFileFilter('limit_sharp', function(sharp, file, cb) {

    if(!sharp) {
        cb(true);
        return;
    }

    if( Object.prototype.toString.call( sharp ) !== '[object Array]' ) {
        cb(true);
        return;
    }

    var _width = sharp[0];
    var _height = sharp[1];
    var _minWidth = sharp[2];
    var _sharp = _width / _height;

    var that = this;
    var img = new mOxie.Image();

    img.load(file.getSource());

    img.onload = function() {
        finalize(img);
    };

    img.onerror = function() {
        finalize(false);
    };

    var finalize = function(img) {
        if(!img) { 
            cb(false);
            return; 
        };

        console.log(img.width);
        console.log(img.height);

        var _realSharp = img.width / img.height;
        var deltaSharp = Math.abs(_sharp - _realSharp);

        if(deltaSharp > 0.01) {
            that.trigger('Error', {
                code : -888,
                message : 'File sharp error.',
                file: file,
                img: {
                    width: _width,
                    height: _height
                }
            });
            cb(false)
        } else if(_minWidth && img.width < _minWidth) {
            that.trigger('Error', {
                code : -889,
                message : 'File size too small.',
                file: file,
                img: {
                    width: _width,
                    height: _height
                }
            });
            cb(false)
        }
        else {
            cb(true);
        }
    }
});

/**
 * @param  {DOM object} 初始化图片上传dom
 * @param  {JSON object} '签名数据'
 * @param  {string} size 图片大小 '200kb'
 * @param  {string/array} sharp 图片宽度/高度比例 false为不限制 为数组时：[比例，最小宽度]；
 * @param  {function} successCallBack 成功回调函数
 * @return {[type]}
 */

initUploader = function(ele, data, _size, _sharp, successCallBack) {
    var policy = data.policy;   

    var uploader = new plupload.Uploader({

        runtimes : 'html5,flash,silverlight,html4',

        browse_button : $(ele).find('.upload-btn').attr('id'),

        container: ele,

        flash_swf_url : 'plupload/Moxie.swf',

        silverlight_xap_url : 'plupload/Moxie.xap',

        url : policy.host,

        multi_selection: false,

        multipart_params: {

            'policy': policy.policyBase64,

            'OSSAccessKeyId': policy.accessid, 

            'success_action_status' : '200', //让服务端返回200,不然，默认会返回204

            'signature': policy.signature,
            
            'callback': policy.callback

        },

        filters: {
          mime_types : [
            { title : "Image files", extensions : "jpg,jpeg,png" },
          ],
          max_file_size: _size,
          limit_sharp : _sharp
        },

        init: {
            PostInit: function() {
                this._$ele = $(ele);
                this._$imgCt = this._$ele.find('.img-ct');
                this._$mask = this._$ele.find('.mask');
                this._$thumb = this._$ele.find('.thumb');
                this._$msg = this._$ele.find('.msg');
            },

            FilesAdded: function(up, files) {

                //file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
                this._$msg.hide();
                this._$ele.addClass('uploading');
                this._filename = guid() + '.jpg';
                this._$mask.show();

                up.setOption({
                    multipart_params: {

                        'Filename': this._filename,

                        'key' : this._filename,

                        'policy': policy.policyBase64,

                        'OSSAccessKeyId': policy.accessid, 

                        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204

                        'signature': policy.signature,
                        
                        'callback': policy.callback
                    }
                });

                var that = this;

                plupload.each(files, function(file) {
                    //预览图片
                    previewImage(file, function(imgSrc) {
                        that._$mask.show()
                        that._$thumb.attr('src', imgSrc);
                    })
                    uploader.start();
                });

            },

            UploadProgress: function(up, file) {
                this._$mask.height( (1 - file.percent / 100) * this._$imgCt.height() );
            },

            FileUploaded: function(up, file, info) {
                this._$ele.removeClass('uploading');

                this._$mask.hide().height('100%');

                if (info.status >= 200 || info.status < 200)
                {
                    console.log('done');
                    this._$thumb.attr('src', policy.host + '/' + this._filename);
                    successCallBack(info);
                }
                else
                {
                    console.log(info.response);
                }
            },

            Error: function(up, err) {

                this._$ele.removeClass('uploading');

                var config = {}

                if(err.code == -888) {
                    config.text = '请选择分辨率为 '+err.img.width+' * '+err.img.height+' 的图片';
                } else if(err.code == -889) {
                    config.text = '请选择分辨率为 '+err.img.width+' * '+err.img.height+' 的图片';
                } else if(err.code == -600) {
                    config.text = '图片大小超出限制';
                } else if(err.code == -601) {
                    config.text = '文件格式错误';
                } else if(err.code == -200) {
                    config.text = '上传错误，请重试';
                } else {
                    config.text = err.message;
                }

                $.popup(config)._openPop();

                console.log(err);
            }
        }
    });
    uploader.init();

}

$(function() {
    $.post('/policy').success(function(data) {

        initUploader($('.desktop-ed')[0], data, '2048kb', false, function(info) {
            console.log('success');
        });

    });
});