import { createRouter, createWebHistory } from 'vue-router'
import { defineAsyncComponent } from 'vue'

const router = createRouter({
    history: createWebHistory(), //路由器的工作模式
    routes: [ //一个个的路由规则
        {
            path: '/', //首页路径
            name: 'Home',
            component: () => import('../components/Home.vue'),
            children: [
                {
                    path: 'login', // 用户登录子路由
                    name: 'Login',
                    component: () => import('../components/views/Login.vue')
                },
                {
                    path: 'adminlogin', // 管理员登录子路由
                    name: 'Administerlogin',
                    component: () => import('../components/views/Administerlogin.vue')
                },
                {
                    path: 'register', // 用户注册子路由
                    name: 'Register',
                    component: () => import('../components/views/Register.vue')
                }
            ]
        },
        {
            path: '/Administer', //管理员访问路径
            name: 'Administer',
            component: () => import('../components/Administer.vue')
            ,
            children: [
                {
                    path: 'GoodsForSale', //管理员访问路径
                    name: 'AdministerGoodsForSale',
                    component: () => import('../components/Administer_plus/AdministerGoodsForSale.vue')
                },
                {
                    path: 'Deliverymen', //管理员访问路径
                    name: 'AdministerDeliverymen',
                    component: () => import('../components/Administer_plus/AdministerDeliverymen.vue')
                },
                {
                    path: 'Users', //管理员访问路径
                    name: 'AdministerUsers',
                    component: () => import('../components/Administer_plus/AdministerUsers.vue')
                },
                {
                    path: 'GoodsComplaint', //管理员访问路径
                    name: 'AdministerGoodsComplaint',
                    component: () => import('../components/Administer_plus/AdministerGoodsComplaint.vue')
                },
                {
                    path: 'DeliverymenComplaint', //管理员访问路径
                    name: 'AdministerDeliverymenComplaint',
                    component: () => import('../components/Administer_plus/AdministerDeliverymenComplaint.vue')
                },
                {
                    path: 'SellerComplaint', //管理员访问路径
                    name: 'AdministerSellerComplaint',
                    component: () => import('../components/Administer_plus/AdministerSellerComplaint.vue')
                },
                {
                    path: 'Documents', //管理员访问路径
                    name: 'AdministerDocuments',
                    component: () => import('../components/Administer_plus/AdministerDocuments.vue')
                },
                {
                    path: 'InfoChange', //管理员访问路径
                    name: 'AdministerInfoChange',
                    component: () => import('../components/Administer_plus/AdministerInfoChange.vue')
                },
                {
                    path: 'Goods',
                    name: 'Goods',
                    component: () => import('../components/Goods/Goods.vue')
                }
            ]
        },
        // 保留原来的独立登录路由，以便兼容现有代码
        {
            path: '/login',
            redirect: { name: 'Login' }
        },
        {
            path: '/Administerlogin',
            redirect: { name: 'Administerlogin' }
        },
        {
            path: '/register',
            redirect: { name: 'Register' }
        },
        //用户界面
        {
            path: '/user_menu',
            name: 'User_menu',
            component: () => import('../components/User/Menu.vue')
            ,
            children:
                [
                    {
                        path: 'show_info',
                        name: 'InfoShow',
                        component: () => import('../components/User/UserPage/ShowInfo.vue')
                    },

                    {
                        path: 'info_editor',
                        name: 'InfoEditor',
                        component: () => import('../components/User/UserPage/InfoEditor.vue')
                    },


                    {
                        path: 'count_control',
                        name: 'CountControl',
                        component: () => import('../components/User/UserPage/CountControl.vue')
                    },
                    //发布商品界面
                    {
                        path: 'goods_sell',
                        name: 'GoodsSell',
                        component: () => import('../components/User/UserPage/GoodsSell.vue')

                    },

                    //我发布的商品界面

                    {
                        path: 'goods_self',
                        name: 'GoodsSelf',
                        component: () => import('../components/User/UserPage/GoodsSelf.vue')

                    },

                    //待售商品界面
                    {
                        path: 'goods',
                        name: 'MyGoods',
                        component: () => import('../components/User/UserPage/Goods.vue')
                    },

                    //处理卖出的订单的申诉

                    {
                        path: 'goods_appealed',
                        name: 'GoodsAppealed',
                        component: () => import('../components/User/UserPage/GoodsAppealed.vue')
                    },

                    //还未未配送的订单
                    {
                        path: 'orders_for_deliver',
                        name: 'OrdersForDeliver',
                        component: () => import('../components/User/UserPage/OrdersForDeliver.vue')
                    },

                    //正在配送的订单
                    {
                        path: 'orders_delivering',
                        name: 'OrdersDelivering',
                        component: () => import('../components/User/UserPage/OrdersDelivering.vue')
                    }
                    ,
                    //已经到达的订单
                    {
                        path: 'orders_delivered',
                        name: 'OrdersDelivered',
                        component: () => import('../components/User/UserPage/OrdersDelivered.vue')
                    }
                    ,
                    //申诉中的订单
                    {
                        path: 'orders_appealing',
                        name: 'OrdersAppealing',
                        component: () => import('../components/User/UserPage/OrdersAppealing.vue')
                    }
                    ,
                    //已经完成的订单
                    {
                        path: 'orders_accomplished',
                        name: 'OrdersAccomplished',
                        component: () => import('../components/User/UserPage/OrdersAccomplished.vue')
                    }
                ]

        },

        //骑手界面
        {
            path: '/deliver_menu',
            name: 'Deliver_menu',
            component: () => import('../components/Deliver/Menu.vue'),

            children:
                [
                    {
                        path: 'show_info',
                        name: 'DeliverInfoShow',
                        component: () => import('../components/Deliver/DeliverPage/ShowInfo.vue')
                    },

                    {
                        path: 'info_editor',
                        name: 'DeliverInfoEditor',
                        component: () => import('../components/Deliver/DeliverPage/InfoEditor.vue')
                    },


                    {
                        path: 'count_control',
                        name: 'DeliverCountControl',
                        component: () => import('../components/Deliver/DeliverPage/CountControl.vue')
                    },

                    //待接单

                    {
                        path: 'waited_deliver',
                        name: 'WaitedDeliver',
                        component: () => import('../components/Deliver/DeliverPage/WaitedDeliver.vue')
                    },
                    //配送
                    {
                        path: 'delivering',
                        name: 'Delivering',
                        component: () => import('../components/Deliver/DeliverPage/Delivering.vue')
                    }

                ]
        },
    ],
})

//暴露出去
export default router