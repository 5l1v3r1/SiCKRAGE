const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const SpritesmithPlugin = require('webpack-spritesmith');

const templateFunction = function (data) {
    var iconName = path.basename(data.sprites[0].image, path.extname(data.sprites[0].image))
        .replace('~', '');

    var shared = '.D { display: inline-block; background-image: url(I) }'
        .replace('D', iconName)
        .replace('I', data.sprites[0].image);

    var perSprite = data.sprites.map(function (sprite) {
        var spriteName = sprite.name
            .replace(/(?!\w|\s)./g, '')
            .replace(/\s+/g, '-')
            .replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2');

        return '.D-N { width: Wpx; height: Hpx; background-position: Xpx Ypx; }'
            .replace('D', iconName)
            .replace('N', spriteName)
            .replace('W', sprite.width)
            .replace('H', sprite.height)
            .replace('X', sprite.offset_x)
            .replace('Y', sprite.offset_y);
    }).join('\n');

    return shared + '\n' + perSprite;
};

const makeSprite = function (dir) {
    return new SpritesmithPlugin({
        src: {
            cwd: path.resolve(__dirname, 'src/ico/sickrage', dir),
            glob: '*.png'
        },
        target: {
            image: path.resolve(__dirname, 'src/spritesmith-generated/sickrage-' + dir + '.png'),
            css: [
                [path.resolve(__dirname, 'src/spritesmith-generated/sickrage-' + dir + '.css'), {
                    format: 'function_based_template'
                }]
            ]
        },
        apiOptions: {
            cssImageRef: '~sickrage-' + dir + '.png'
        },
        customTemplates: {
            'function_based_template': templateFunction
        }
    });
};

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'sickrage/core/webserver/static/js'),
        filename: 'core.min.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.js$/,
                exclude: [
                    /node_modules/,
                    /bower_components/
                ],
                loader: "eslint-loader"
            },
            {
                test: /\.js$/,
                exclude: [
                    /node_modules/,
                    /bower_components/
                ],
                loader: "babel-loader",
                options: {
                    presets: ['env']
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: '../fonts/'
                    }
                }]
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: "file-loader",
                query: {
                    name: '[name].[ext]',
                    outputPath: '../images/'
                }
            }
        ]
    },
    resolve: {
        modules: ["node_modules", "spritesmith-generated"]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new CleanWebpackPlugin([
            'sickrage/core/webserver/static/css/*.*',
            'sickrage/core/webserver/static/js/*.*'
        ]),
        new MiniCssExtractPlugin({
            filename: "../css/core.min.css",
            chunkFilename: "[id].css"
        }),
        new OptimizeCSSAssetsPlugin(),
        makeSprite('core'),
        makeSprite('network'),
        makeSprite('notifiers'),
        makeSprite('providers'),
        makeSprite('subtitles')
    ]
};