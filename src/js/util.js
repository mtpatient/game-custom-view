import {Message} from 'element-ui'

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