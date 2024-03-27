export default [
    {
        path: '/back-Management',
        name: 'back-management',
        component: () => import('@/view/backManagement.vue'),
        meta: {
            title: '后台管理'
        },
        children: [
            {
                path: 'index',
                name: "index",
                component: () => import('@/view/backManagement/index.vue'),
                meta: {
                    title: '后台管理'
                }
            },
            {
                path: 'section',
                name: 'section-management',
                component: () => import('@/view/backManagement/SectionComponent.vue'),
                meta: {
                    title: '板块管理'
                }
            },
            {
                path: 'avatar',
                name: 'avatar-management',
                component: () => import('@/view/backManagement/AvatarManagement.vue'),
                meta: {
                    title: '头像管理'
                }
            },
            {
                path: 'user',
                name: 'user-management',
                component: () => import('@/view/backManagement/UserManagement.vue'),
                meta: {
                    title: '用户管理'
                }
            },
            {
                path: 'post',
                name: 'post-management',
                component: () => import('@/view/backManagement/PostManagement.vue'),
                meta: {
                    title: '帖子管理'
                }
            },
            {
                path: 'comment',
                name: 'comment-management',
                component: () => import('@/view/backManagement/CommentManagement.vue'),
                meta: {
                    title: '评论管理'
                }
            },
            {
                path: "feedback",
                name: "feedback-management",
                component: () => import('@/view/backManagement/FeedBackManagement.vue'),
                meta: {
                    title: "反馈列表"
                }
            },
            {
                path: "images",
                name: "images-management",
                component: () => import('@/view/backManagement/ImageManagement.vue'),
                meta: {
                    title: "图片管理"
                }
            },
            {
                path: "adm-log",
                name: "Log-management",
                component: () => import('@/view/backManagement/LogManagement.vue'),
                meta: {
                    title: "管理日志"
                }
            },
            {
                path: "slide-show",
                name: "slideshow-management",
                component: () => import('@/view/backManagement/SlideShowManagement.vue'),
                meta: {
                    title: "轮播图管理"
                }
            },
            {
                path: "announcement",
                name: "announcement-management",
                component: () => import('@/view/backManagement/Announcement.vue'),
                meta: {
                    title: "发布公告"
                }
            }
        ],
    }
]