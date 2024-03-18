import {Message} from 'element-ui'
import Compressor from 'compressorjs'

export function checkNickName(name) {
    const emailRegex = /^[A-Za-z0-9]+([-._][A-Za-z0-9]+)*@[A-Za-z0-9]+(-[A-Za-z0-9]+)*(\.[A-Za-z]{2,6}|[A-Za-z]{2,4}\.[A-Za-z]{2,3})$/

    if (emailRegex.test(name)) {
        return true
    }
    if (name.length >= 2 && name.length <= 12) {
        // 使用正则表达式检查特殊字符
        const specialCharacterRegex = /[!@#$%^&*()/\\,.?":{}|<>]/;
        if (specialCharacterRegex.test(name)) {
            Message({
                message: '昵称不能包含特殊字符: [!@#$%^&*(),/\\.?":{}|<>]',
                type: 'warning'
            })
            return false
        } else {
            return true
        }
    } else {
        Message({
            message: '昵称长度为2-12位',
            type: 'warning'
        })
        return false
    }
}

/**
 * 随机生成字符串
 * @param len 指定生成字符串长度
 */
function getRandomString(len) {
    let _charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
        min = 0,
        max = _charStr.length - 1,
        _str = '';                    //定义随机字符串 变量
    //判断是否指定长度，否则默认长度为15
    len = len || 10;
    //循环生成字符串
    let i = 0, index;
    for (; i < len; i++) {
        index = (function (randomIndexFunc, i) {
            return randomIndexFunc(min, max, i, randomIndexFunc);
        })(function (min, max, i, _self) {
            let indexTemp = Math.floor(Math.random() * (max - min + 1) + min),
                numStart = _charStr.length - 10;
            if (i === 0 && indexTemp >= numStart) {
                indexTemp = _self(min, max, i, _self);
            }
            return indexTemp;
        }, i);
        _str += _charStr[index];
    }
    return _str;
}

export function generateRandomStrings(len, count) {
    const _strings = []
    for (let i = 0; i < count; i++) {
        _strings.push(getRandomString(len))
    }

    return _strings
}

export function handleImgCompress(files) {
    return new Promise((resolve, reject) => {
        const resFiles = [];
        let compressCount = 0;

        for (let i = 0; i < files.length; i++) {
            new Compressor(files[i], {
                quality: 0.2,
                success(result) {
                    // console.log('compress success', result.size)
                    const compressedFile = new File([result], files[i].name, {type: files[i].type});
                    resFiles.push(compressedFile);
                    compressCount++;

                    // 如果所有文件都已压缩完成，则resolve Promise
                    if (compressCount === files.length) {
                        resolve(resFiles);
                    }
                },
                error(err) {
                    console.log('压缩失败:', err);
                    compressCount++;
                    // 如果所有文件都已压缩完成（即使有错误），则resolve  Promise
                    if (compressCount === files.length) {
                        resolve(resFiles);
                    }
                }
            });
        }

        // 如果没有文件需要压缩，则直接resolve空数组
        if (files.length === 0) {
            resolve(resFiles);
        }
    });
}


// 防抖函数
export function debounce(before, after, wait) {
    /*option说明： before [事件触发时立即执行的函数];
                   after [回调函数];
                   wait [回调触发延迟时间ms]
    */
    var timer
    return function () {
        before && before();
        timer && clearTimeout(timer);
        timer = setTimeout(function () {
            after && after();
            timer = null;
        }, wait);
    }
}