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
Vue.prototype.CosUrl = config.CosUrl
// 封装axios
Vue.prototype.$axios = axios;
// 封装localStorage
Vue.prototype.$storage = storage
// localStorage 超时时间 单位：minute
Vue.prototype.ExpireTime = config.EXPIRE_TIME

new Vue({
    render: h => h(App),
    router,
}).$mount('#app')
