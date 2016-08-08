'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    s3 = require('gulp-s3'),
    fs = require('fs'),
    wrap = require("gulp-wrap"),
    aws = readAwsFile();

function readAwsFile() {
    try {
        var awsFile = fs.readFileSync('./aws.json');
        return JSON.parse(awsFile);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        return null;
    }
}

gulp.task('scripts', function () {
    return gulp.src('src/*.js')
        .pipe(concat('all.js'))
        .pipe(rename('apester-javascript-sdk.min.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function () {
    gulp.watch('src/*.js', ['scripts']);
});

gulp.task('default', function () {
    return gulp.src(['src/*.js'])
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

gulp.task('deploy', ['default'], function () {
    aws.folders.forEach(function (folder) {
        return gulp.src('./dist/**')
            .pipe(s3(aws.credentials, {uploadPath: folder}));
    });
});
