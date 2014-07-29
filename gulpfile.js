var gulp = require("gulp"),
    uglify = require("gulp-uglifyjs"),
    jshint = require("gulp-jshint"),
    stylish = require("jshint-stylish"),
    size = require("gulp-size"),
    concat = require("gulp-concat"),
    minifyCSS = require("gulp-minify-css"),
    _ = require("lodash"),
    karma = require("karma").server,
    imagemin = require("gulp-imagemin"),
    pngcrush = require("imagemin-pngcrush");

var p = function (path) {
    return __dirname + (path.charAt(0) === "/" ? "" : "/") + path;
};

// jQuery is here only for easy clicks and such.
var karmaFiles = [
    {pattern: "test/*.js"},
    {pattern: "dist/js/**/*.js"},
    {pattern: "test/spec/**/*.js"},
    {pattern: "test/**/*.html"}
];

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task("tdd", function (done) {

    var karmaTddConf = {
        browsers: ["PhantomJS"],
        frameworks: ["jasmine"],
        files: karmaFiles
    };

    karma.start(karmaTddConf, done);

});

gulp.task("jshint", function () {
    return gulp.src(p("src/js/**/*.js"))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter("default"));
});

gulp.task("image-min", function () {
    return gulp.src("src/images/**/*")
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest("dist/images"));
});

gulp.task("uglify", function () {
    gulp.src(p("src/js/**/*.js"))
        .pipe(uglify())
        .pipe(size({showFiles: true, gzip: true}))
        .pipe(gulp.dest(p("dist/js")));
});

gulp.task("css-min", function() {
    gulp.src(p("src/css/easy-slider.css"))
        .pipe(minifyCSS())
        .pipe(gulp.dest("dist/css"));
});

gulp.task("watch", ["build"], function () {
    gulp.watch([
        p("src/**/*.js"),
        p("test/**/*.js")
    ], ["uglify"]);
});

gulp.task("build", ["uglify", "css-min", "image-min"]);

/**
 * Run test once and exit
 */
gulp.task("test", ["build"], function (done) {

    var karmaTestConf = {
        browsers: ["Firefox"],
        frameworks: ["jasmine"],
        files: karmaFiles,
        preprocessors : {"test/**/*.html": "html2js"}
    };

    karma.start(_.assign({}, karmaTestConf, {singleRun: true}), done);

});

gulp.task("default", ["build", "tdd", "watch"]);
