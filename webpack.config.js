module.exports = {
    entry: './src/build-render',
    output: {
        path: __dirname + '/dist',
        filename: 'wysimdown-render.js'
    },
    module: {
        loaders: [
            { test: /\.jsx/, loader: 'jsx' },
            { test: /\.gif/, loader: 'url?limit=10000&mimetype=image/gif' },
            { test: /\.less/, loader: 'style!css!less' }
        ]
    },
    resolve: {
        alias: {
            fs: __dirname + '/libs/fs'
        },
        modulesDirectories: ['node_modules', 'bower_components']
    }
};