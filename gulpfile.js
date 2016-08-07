'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    fs = require('fs'),
    wrap = require("gulp-wrap");

gulp.task('default', function () {
    return gulp.src('./src/*.js')
        .pipe(concat('all.js'))
        .pipe(wrap('try {\n(function(){\n \'use strict\'\n <%= contents %>\n})(); \n}\n catch(e) { ' +
            ' var xmlHttp = new XMLHttpRequest();'
            + 'xmlHttp.open("POST", "https://events.apester.com/event", true);'
            + 'xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");'
            + 'xmlHttp.send(JSON.stringify({' +
            'event: "apester-sdk-crashed",' +
            'properties: {' +
            'destinationUri: document.location.href' +
            '},' +
            'metadata: {' +
            'userAgent: navigator.userAgent' +
            '}' +
            '}' +
            '));'
            + 'console.error("ApesterSDK had critical error, please contact us with the following error message: ", e)}'
        ))
        .pipe(rename('apester-javascript-sdk.js'))
        .pipe(gulp.dest('dist/'))
        .pipe(uglify())
        .pipe(rename('apester-javascript-sdk.min.js'))
        .pipe(gulp.dest('dist/'));
});
