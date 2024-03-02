import axios from "axios";
import config from "@/config";
import {Message} from 'element-ui'
import router from "@/router";
import storage from "@/js/storage";

const instance = axios.create(
    {
        baseURL: config.REQUEST_URL,
        timeout: 5000,//超时时间
    }
)

// 请求发起前拦截
instance.interceptors.request.use(
    (config) => {
        config.headers['Token'] = storage.get('token')
        return config
    },
    (error) => {
        return Promise.reject(error)
    })

// 响应拦截（请求返回后拦截）
// 响应拦截器
instance.interceptors.response.use(response => {
        console.log("进入响应拦截器");
        //接收到响应数据并成功后的一些共有的处理，关闭loading等
        return response
    },
    error => {
        /***** 接收到异常响应的处理开始 *****/
        if (error && error.response) {
            // 根据响应码具体处理
            switch (error.response.status) {
                case 400:
                    error.message = '错误请求'
                    break;
                case 401:
                    error.message = '未授权，请重新登录'
                    break;
                case 403:
                    error.message = '拒绝访问'
                    router.push('/login').then(() => {
                        Message({
                            message: '请先登录',
                            type: 'error'
                        })
                        storage.remove("token")
                        storage.remove("user")
                    })
                    break;
                case 404:
                    error.message = '请求错误,未找到该资源'
                    // window.location.href = "/NotFound"
                    break;
                case 405:
                    error.message = '请求方法未允许'
                    break;
                case 408:
                    error.message = '请求超时'
                    break;
                case 500:
                    error.message = '服务器端出错'
                    break;
                case 501:
                    error.message = '网络未实现'
                    break;
                case 502:
                    error.message = '网络错误'
                    break;
                case 503:
                    error.message = '服务不可用'
                    break;
                case 504:
                    error.message = '网络超时'
                    break;
                case 505:
                    error.message = 'http版本不支持该请求'
                    break;
                default:
                    error.message = `连接错误${error.response.status}`
            }
        } else {
            // 超时处理
            if (JSON.stringify(error).includes('timeout')) {
                Message.error('服务器响应超时，请刷新当前页')
            }
            error.message = '连接服务器失败'
        }
        Message.error(error.message)
        /***** 处理结束 *****/
        return Promise.resolve(error.response)
    }
)


export default {
    get(url, data) {
        return instance.get(url, {params: data})
    },
    post(url, data) {
        return instance.post(url, data)
    },
    put(url, data) {
        return instance.put(url, data)
    },
    del(url) {
        return instance.delete(url)
    },
    async putImg(url, data, f) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true)
        xhr.onload = f
        xhr.send(data)
    },
    getCOSSignature(count){
        return instance.get(`/img/getSignature/${count}`)
    },
}