import VueRouter from "vue-router";

const baseRoutes = [
    {
        path: '/',
        name: 'index',
        component: () => import('@/view/index.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/view/login.vue')
    },
    {
        path: '/edit',
        name: 'edit',
        component: () => import('@/view/edit.vue')
    },
    {
        path: '/back-Management',
        name: '',
        component: () => import('@/view/backManagement.vue')
    }
];

import userRoutes from './user'

const routes = baseRoutes.concat(userRoutes);

// 路由规则
const router = new VueRouter({routes})
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};


export default router;
