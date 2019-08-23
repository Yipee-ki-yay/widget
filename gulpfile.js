//MAIN
const gulp          = require('gulp'), //Gulp
browserSync         = require('browser-sync').create(), // Local server

//HTML
// pug                    = require('gulp-pug'), // Pug(Jade) into HTML
htmlhint            = require("gulp-htmlhint"),

//CSS
autoPrefixer            = require('autoprefixer'), // Autoprefixer for older browsers
cssnano                 = require('gulp-cssnano'), // CSS minification
// cssnext              = require('postcss-cssnext'), // CSS4 syntax
mediaPacker             = require('css-mqpacker'), // Gather all media queries together
sass                    = require('gulp-sass'),
sourcemaps              = require('gulp-sourcemaps'), //Deep analysis for file direction
postcss                 = require('gulp-postcss'), // Sass sytnax in css
// postcssFlexbugsFixes     = require('postcss-flexbugs-fixes'),
postcssFocus            = require('postcss-focus'),
purgecss                = require('gulp-purgecss'), //clean unused css

//JS
babel                   = require('gulp-babel'), // Convert ES6 syntax into ES5
uglify                  = require('gulp-uglify'), // JavaScript minification

//OTHER
// absolutePath         = require('path'), // Create file's path
// cache                    = require('gulp-cached'), // Cache edited files
// concat                   = require('gulp-concat'), // Get different files joined
del                     = require('del'), // Remove files
// gulpIf                   = require('gulp-if'),
fileInclude             = require('gulp-file-include'),
imagemin                = require('gulp-imagemin'), // Minify images
notify                  = require('gulp-notify'), // Tell about error during task processing
pngquant                = require('imagemin-pngquant'), // Imagemin plugin for png
rename                  = require('gulp-rename'), // Rename files
replace                 = require('gulp-replace'),
size                    = require('gulp-size');


// ===========OPTIONS==============
var serverDevConfig = {
    server: { baseDir: 'build' },
    tunnel: false,
    ghostMode: false,
    online: false,
    open: false,
    notify: false,
    host: 'localhost',
    logPrefix: "FrontendDEV",
    reloadDelay: 300
};
// ----------
var serverProdConfig = {
    server: { baseDir: "production" },
    tunnel: false,
    ghostMode: false,
    online: false,
    open:  true,
    host: 'localhost',
    logPrefix: "FrontendPROD",
    reloadDelay: 500
};

var serverTunnelConfig = {
    server: { baseDir: "production" },
    tunnel: 'tunnel',  //you can set URL name here 
    ghostMode: false,
    online: true,
    open:  "tunnel",
    host: 'localhost',
    logPrefix: "FrontendPROD",
    reloadDelay: 500
};
// --------------
var path = {
    build: { //patch for builded files
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    buildProd: { //patch for builded files
        html: 'production/',
        js: 'production/js/',
        css: 'production/css/',
        img: 'production/img/',
        fonts: 'production/fonts/'
    },
    src: { //patch for source files
        html: 'src/*.html', 
        js: 'src/js/index.js',
        libsJs: 'src/js/libs/*.js',
        minifiedJs: 'src/js/libs/minified/*.min.js',
        scss: 'src/styles/main.scss',
        scssWgt: 'src/styles/wgt.scss',
        css: 'src/styles/libs/*.css',
        purgingcss: 'src/styles/libs/for_purgecss/*.css',
        minifiedCss: 'src/styles/libs/minified/*.min.css',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //patch for wathching files
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        styles: 'src/styles/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    cleanProduction: 'production',
    cleanBuild: 'build',
    cleanImg: 'build/img'
};

// --------PostCSS Config--------
var postcssConfig = [
    autoPrefixer(),
    // postcssFlexbugsFixes(),
    mediaPacker(),
    postcssFocus()
];

// =========== Main ============

gulp.task('test', function(done) {
    console.log('==========GULP TEST OK!==========');
    done();
});

// ----browser-sync----
gulp.task('serverDev', function() {
    browserSync.init( serverDevConfig );
    
});

gulp.task('serverProd', function() {
    browserSync.init( serverProdConfig );
});

gulp.task('serverTunnel', function() {
    browserSync.init( serverTunnelConfig );
});

gulp.task('reload', function(done) {
    browserSync.reload();
    done();
});

// =====================

// =========DEV Builds========
gulp.task('copy_to_root:dev', function () {
    return gulp.src('src/copy_to_root/*.*')
        .pipe(gulp.dest(path.build.html)) 
});
// --------HTML----------
gulp.task('build:html', function (done) {
    gulp.src(path.src.html) 
    .pipe(fileInclude( {prefix: '@@', basepath: '@file'} ))
    // .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint())
    .pipe(htmlhint.reporter())
    .pipe(gulp.dest(path.build.html));
    done(); 
});

// --------JS----------
gulp.task('build:js', function () {
    return gulp.src([path.src.js, path.src.libsJs])
        // .pipe(include()).on('error', console.error) 
        .pipe(fileInclude({prefix: '@@', basepath: '@file'})).on('error', console.error) 
        .pipe(sourcemaps.init()) 
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js)) 
});

gulp.task('copy:js', function () {
    return gulp.src([path.src.minifiedJs])
        .pipe(gulp.dest(path.build.js)) 
});

// --------CSS----------
gulp.task('build:css', function () {
    return gulp.src([path.src.scss, path.src.css]) 
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postcssConfig))
        .pipe(cssnano({zindex: false}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
});

gulp.task('build:cssWgt', function () {
    return gulp.src([path.src.scssWgt]) 
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postcssConfig))
        .pipe(cssnano({zindex: false}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
});

gulp.task('copy:css', function () {
    return gulp.src([path.src.minifiedCss])
        .pipe(gulp.dest(path.build.css)) 
});
// --------Images----------
gulp.task('build:image', function () {
   return gulp.src(path.src.img) 
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false, cleanupIDs: true}],
            use: [pngquant()],
            interlaced: true
        })).on('error', console.error) 
        .pipe(gulp.dest(path.build.img)) 
});
// --------Fonts--------
gulp.task('build:fonts', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

// =========PROD Builds========
gulp.task('copy_to_root:prod', function () {
    return gulp.src('src/copy_to_root/*.*')
        .pipe(gulp.dest(path.buildProd.html)) 
});
// --------HTML----------
gulp.task('buildProd:html', function () {
    return gulp.src(path.src.html) 
        .pipe(fileInclude( {prefix: '@@', basepath: '@file'} ))
        // .pipe(htmlhint())
        // .pipe(htmlhint.reporter())
        .pipe(replace('IWRBGKR', 'IWZJMLM'))
        .pipe(gulp.dest(path.buildProd.html))
        .pipe(size({ title: 'html size =' }))
});
// --------JS----------
gulp.task('buildProd:js', function () {
    return gulp.src([path.src.js, path.src.libsJs])
        .pipe(fileInclude({prefix: '@@', basepath: '@file'})).on('error', console.error) 
        .pipe(babel() ).on('error', function(err) {
            notify({ title: 'js:buildProd task error!' }).write(err.message);
            this.emit('end');
        })
        .pipe(uglify())
        .pipe(rename( {suffix: '.min'} ))
        .pipe(replace('https://api.dev.vouch4.me/v1/widget', 'https://api.vouch4.me/v1/widget'))
        .pipe(gulp.dest(path.buildProd.js))
        .pipe(size({ title: 'js size =' }))
});

gulp.task('copyProd:js', function () {
    return gulp.src([path.src.minifiedJs])
        .pipe(gulp.dest(path.buildProd.js)) 
});

// --------CSS----------
gulp.task('buildProd:css', function () {
    return gulp.src([path.src.scss, path.src.css])
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postcssConfig))
        .pipe(cssnano({zindex: false}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.buildProd.css))
        .pipe(size({ title: 'styles size =' })) 
});

gulp.task('buildProd:cssWgt', function () {
    return gulp.src([path.src.scssWgt]) 
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postcssConfig))
        .pipe(cssnano({zindex: false}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.buildProd.css))
        .pipe(size({ title: 'styles size =' })) 
});

gulp.task('copyProd:css', function () {
    return gulp.src([path.src.minifiedCss])
        .pipe(gulp.dest(path.buildProd.css)) 
});

gulp.task('purgecss', () => {
  return gulp.src(['production/css/main.min.css',path.src.purgingcss])
       .pipe(
            purgecss({
                content: ['production/*.html'],
                whitelistPatterns: [/\bjs_/, /active/, /\bslick-/, /\bicon-/, /\bchosen-/, /\bcbox/, /colorbox/, /\blombard/, /\bgm/]
            })
        )
       .pipe(gulp.dest('production/css/'))
       .pipe(size({ title: 'styles size after purge =' })) 

})
// ---------Images----------
gulp.task('buildProd:image', function () {
    return gulp.src(path.src.img) 
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false, cleanupIDs: true}],
            use: [pngquant()],
            interlaced: true
        })).on('error', console.error) 
        .pipe(gulp.dest(path.buildProd.img))
        .pipe(size({ title: 'images size =' }))  
});
// ---------Fonts--------
gulp.task('buildProd:fonts', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.buildProd.fonts))
        .pipe(size({ title: 'fonts size =' })) 
});

// =========Build===========

gulp.task('clean:build', function() {
    return del(path.cleanBuild);
});
gulp.task('clean:production', function() {
    return del(path.cleanProduction);
});
gulp.task('clean:img', function() {
    return del(path.cleanImg);
});

// -----Dev-----
gulp.task('build:dev', gulp.series('clean:build', gulp.parallel(
    'build:html','build:js','copy:js','build:css','build:cssWgt','copy:css','build:fonts','build:image','copy_to_root:dev'
    )));

// -----Prod-----
gulp.task('build:prod', gulp.series('clean:production', gulp.series(
    'copy_to_root:prod',
    'buildProd:html',
    'buildProd:js',
    'copyProd:js',
    'buildProd:css',
    'buildProd:cssWgt',
    'copyProd:css',
    'purgecss',
    'buildProd:fonts',
    'buildProd:image'
    )));

// =========Watch===========
gulp.task('watch', function() {
    gulp.watch( path.watch.html, gulp.series('build:html', 'reload') );
    gulp.watch( path.watch.styles, gulp.series('build:css', 'reload') );
    gulp.watch( path.watch.styles, gulp.series('build:cssWgt', 'reload') );
    gulp.watch( path.watch.js, gulp.series('build:js', 'reload') );
    gulp.watch( path.watch.img, gulp.series('clean:img', 'build:image', 'reload') );
    gulp.watch( path.watch.fonts, gulp.series('build:fonts', 'reload') );
});

// =============DEVELOPMENT=============
gulp.task('dev', gulp.series('build:dev', gulp.parallel('watch', 'serverDev') ));

// =============PRODUCTION=============
gulp.task('prod', gulp.series('build:prod', 'serverProd') );

// =============Tunnel=============
gulp.task('tunnel', gulp.series('build:prod', 'serverTunnel') );
