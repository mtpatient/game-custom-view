const {defineConfig} = require('@vue/cli-service')
// var webpack = require('webpack')
module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    // 配置富文本图片拖拽
    // configureWebpack: {
    //     plugins: [
    //         new webpack.ProvidePlugin({
    //             'window.Quill': 'quill/dist/quill.js',
    //             'Quill': 'quill/dist/quill.js',
    //         })
    //     ]
    // }
})
