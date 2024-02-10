import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import router from './router/index'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from "./js/api";
import config from "@/config";
import storage from "@/js/storage";


Vue.use(ElementUI)
Vue.use(VueRouter)

Vue.config.productionTip = false

// 后端api前缀
Vue.prototype.REQUEST_URL = config.REQUEST_URL
// 腾讯云COS域名
Vue.prototype.CosDomain = config.CosDomain
// 封装axios
Vue.prototype.$axios = axios;
// 封装localStorage
Vue.prototype.$storage = storage
// localStorage 超时时间 单位：minute
Vue.prototype.ExpireTime = config.EXPIRE_TIME
// 是否使用七牛云对象存储
Vue.prototype.QINIUOS = config.QINIUOS || false
// 七牛云存储域名
Vue.prototype.QINIUDomain = config.QINIUDomain
// 默认头像
Vue.prototype.Default_Avatar = config.Default_Avatar
// 上传中提示图片
Vue.prototype.Editor_Img_Uploading = config.Editor_Img_Uploading

router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    }
    next()
})

new Vue({
    render: h => h(App),
    router,
}).$mount('#app')
