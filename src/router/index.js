import VueRouter from "vue-router";

const baseRoutes = [
    {
        path: '/',
        name: 'index',
        component: () => import('@/view/index.vue'),
        meta: {
            title: '首页'
        }
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/view/login.vue'),
        meta: {
            title: '登录'
        }
    },
    {
        path: '/edit',
        name: 'edit',
        component: () => import('@/view/edit.vue'),
        meta: {
            title: '发布帖子'
        }
    },
    {
        path: '/post-detail/:id',
        name: 'post-detail',
        component: () => import('@/view/postDetail.vue'),
        meta: {
            title: '帖子详情'
        }
    }
];

import userRoutes from './user'
import backRoutes from './backManagement'

const routes = baseRoutes.concat(userRoutes, backRoutes);

// 路由规则
const router = new VueRouter({routes})
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};

export default router;
