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
                path: 'section',
                name: 'section',
                component: () => import('@/components/SectionComponent.vue'),
                meta: {
                    title: '板块管理'
                }
            },
            {
                path: 'avatar',
                name: 'avatar',
                component: () => import('@/components/AvatarManagement.vue'),
                meta: {
                    title: '头像管理'
                }
            }
        ],
    }
]