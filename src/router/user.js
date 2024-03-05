export default [
    {
        path: '/person-center',
        name: 'person-center',
        component: () => import('@/view/personalCenter.vue'),
        meta: {
            title: '个人中心'
        },
        children: [
            {
                path: 'post',
                name: 'user-post',
                component: () => import('@/components/user/postList.vue'),
                meta: {
                    title: '帖子 - 个人中心'
                },
            },
            {
                path: 'comment',
                name: 'user-comment',
                component: () => import('@/components/user/commentList.vue'),
                meta: {
                    title: '评论 - 个人中心'
                },
            },
            {
                path: 'collect',
                name: 'user-collect',
                component: () => import('@/components/user/collectList.vue'),
                meta: {
                    title: '收藏 - 个人中心'
                },
            },
            {
                path: 'follow',
                name: 'user-follow',
                component: () => import('@/components/user/followList.vue'),
                meta: {
                    title: '关注 - 个人中心'
                },
            },
            {
                path: 'fans',
                name: 'user-fans',
                component: () => import('@/components/user/fansList.vue'),
                meta: {
                    title: '粉丝 - 个人中心'
                },
            },
            {
                path: 'edit',
                name: 'user-edit',
                component: () => import('@/components/user/user-update.vue'),
                meta: {
                    title: '编辑资料 - 个人中心'
                },
            },
            {
                path: 'feedback',
                name: 'user-feedback',
                component: () => import('@/components/user/user-feedback.vue'),
                meta: {
                    title: '意见反馈 - 个人中心'
                },
            },
            {
                path: 'password',
                name: 'user-password',
                component:()=>import('@/components/user/user-password.vue'),
                meta: {
                    title: '修改密码 - 个人中心'
                },
            }
        ]
    }
]