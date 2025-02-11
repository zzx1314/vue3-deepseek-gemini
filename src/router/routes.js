// 导出 routes
const routes = [
    {
        path:'/',
        name:"deepseek",
        component:()=> import("../views/deepseek/index.vue")
    },
    {
        path:'/okr',
        name:"deepseekOkr",
        component:()=> import("../views/deepseek/okr.vue")
    }
]
export default routes