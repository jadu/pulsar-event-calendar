const sass = require('dart-sass');

module.exports = function(grunt) {

    'use strict';

    grunt.initConfig({
        sass: {
            dev: {
                options: {
                    implementation: sass,
                    outputStyle: 'nested',
                    sourceMap: true
                },
                files: [{
                    cwd:    'src/scss/',
                    dest:   'demo/css/',
                    expand: true,
                    ext:    '.css',
                    extDot: 'first',
                    src:    '*.scss'
                }]
            }
        },
        browserify: {
            dev: {
                files: {
                    'dist/EventCalendar.js': ['index.js']
                },
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    transform: [
                        ['babelify', { presets: ['es2015'] } ]
                    ]
                }
            }
        },
        watch: {
            css: {
                files: ['src/**/*', 'index.js'],
                tasks: ['sass:dev', 'browserify:dev']
            }
        }
    });

    grunt.registerTask('default', ['sass:dev', 'browserify:dev', 'watch']);

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

};