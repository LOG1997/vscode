/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require('./build/gulpfile');
// const plumber = require('gulp-plumber');
// const gutil   = require('gulp-util');
const gulp = require('gulp');
const babel = require('gulp-babel');
// const filter = require('gulp-filter');

// const notNodeModules = filter(function (file) {
// 	return !file.relative.startsWith('test');
// });
// 定义 Babel 编译任务
gulp.task('babel-tsx', (cb) => {
	 gulp.src('src/**/*.tsx') // 指定源文件路径
		// .pipe(notNodeModules)
		.pipe(babel({
			presets: [
				[
					"@babel/preset-env",
					{
						"modules": false
					}
				],
				"@babel/preset-typescript"
			],
			"plugins": [
				"./build/babel/plugin/custom-tsx"
			]
		})) // 使用 Babel 进行编译
		.pipe(gulp.dest('out')) // 输出到目标文件夹
		cb();
});

// 监听文件变化并自动运行 Babel 编译任务
gulp.task('watch-tsx', (cb) => {
	gulp.watch('src/**/*.tsx', gulp.series('babel-tsx'))
	.on('error', function(err) {
        console.error('some watch error:',err.toString());
        this.emit('end'); // 重要：结束流以防止进程挂起
	})
	cb();
});


// 默认任务
gulp.task('default', gulp.series('babel-tsx', 'watch-tsx'));
