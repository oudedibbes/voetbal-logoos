const gulp = require('gulp');
const autoprefixer = require('autoprefixer');
const sass = require('gulp-dart-scss');
const terser = require('gulp-terser-js');
const imagemin = require('gulp-imagemin');
const cssnano = require('cssnano');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const browsersync = require('browser-sync').create();
const newer = require('gulp-newer');
const rimraf = require('rimraf');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const postcssNormalize = require('postcss-normalize');
const filter = require('gulp-filter');
const htmlmin = require('gulp-htmlmin');

const cachebust = require('gulp-cache-bust');

const replace = require('gulp-replace');

const favicons = require('gulp-favicons');

sass.compiler = require('sass');

// const urlAdjuster = require('gulp-css-replace-url');

// const modifyCssUrls = require('gulp-modify-css-urls');

const { reload } = browsersync;
const { stream } = browsersync;

// BrowserSync
function browserSync(done) {
  browsersync.init({
    proxy: 'https://voetbal-logoos.test',
    https: {
      key: '/usr/local/etc/nginx/certs/voetbal-logoos.test+3-key.pem',
      cert: '/usr/local/etc/nginx/certs/voetbal-logoos.test+3.pem',
    },
  });
  done();
}

// Clean assets
function clean(done) {
  return rimraf('dist', done);
}

// Cachebust
const cbString = new Date().getTime();

function cacheBustTask() {
  return gulp
    .src(['src/**/*.html'])
    .pipe(replace(/cb=\d+/g, `cb=${cbString}`))
    .pipe(gulp.dest('dist'));
}

function html() {
  return (
    gulp
      .src('src/**/*.html')
      .pipe(plumber())

      // .pipe(htmlmin({ collapseWhitespace: true }))
      // .pipe(cachebust({type: "timestamp"}))
      .pipe(gulp.dest('dist'))
      .on('end', reload)
  );
}

// Transpile, concatenate and minify scripts
function polyfills() {
  return gulp
    .src(['src/assets/js/smoothscroll/smoothscroll.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('all-polyfills.js'))
    .pipe(
      terser({
        mangle: {
          toplevel: true,
        },
        output: {
          comments: false,
        },
      }),
    )
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(sourcemaps.write('.'))

    .pipe(gulp.dest('dist/assets/js/polyfills'))
    .on('end', reload);
}

// Transpile, concatenate and minify scripts
function vendors() {
  return (
    gulp
      .src([

        // "src/assets/js/jquery/jquery-3.4.1.js",
        'src/assets/js/modernizr/modernizr-3.8.0.js',

        // "src/assets/js/swiperjs/swiper.js",
        // "src/assets/js/swiperjs/swiper-settings.js"
      ])
      .pipe(plumber())
      .pipe(sourcemaps.init())

      // .pipe(concat("all-vendors.js"))
      .pipe(
        terser({
          mangle: {
            toplevel: true,
          },
          output: {
            comments: false,
          },
        }),
      )
      .pipe(
        rename({
          suffix: '.min',
        }),
      )
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist/assets/js/vendors'))
      .on('end', reload)
  );
}

// Transpile, concatenate and minify scripts
function scripts() {
  return gulp
    .src(['src/assets/js/app.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(terser())
    .pipe(
      rename({
        suffix: '.min',
      }),
    )

    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/assets/js'))
    .on('end', reload);
}

// CSS base task
function css() {
  return gulp
    .src('src/assets/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())

    .pipe(
      sass({
        outputStyle: 'expanded',
        precision: 10,
      }),
    )

    .pipe(
      postcss([
        postcssNormalize({
          forceImport: 'sanitize.css',
        }),
        cssnano(),
      ]),
    )
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(stream());
}

// Optimize Images
function images() {
  return gulp
    .src('src/assets/img/**/*.{png,jpg,jpeg,gif,svg,ico}')
    .pipe(newer('dist/assets/img'))
    .pipe(
      imagemin([
        imagemin.svgo({
          multipass: false,
          plugins: [
            { removeUselessDefs: false },
            { removeHiddenElems: false },
            { removeViewBox: false },
            { cleanupIDs: false },
          ],
        }),
      ]),
    )
    .pipe(gulp.dest('dist/assets/img'))
    .on('end', reload);
}

// Copying fonts
function fonts() {
  return gulp
    .src('src/assets/fonts/**/*')
    .pipe(plumber())
    .pipe(filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe(gulp.dest('dist/assets/fonts'))
    .on('end', reload);
}

// Copying fonts
function favicon() {
  return gulp
    .src('src/assets/favicon/favicon.png')
    .pipe(
      favicons({
        appName: 'Add Darkmode',
        appShortName: 'Darkmode',
        appDescription: 'This website uses darkmode',
        developerName: 'Oude Dibbes',
        developerURL: 'https://www.webcre8ions.com/',
        lang: 'nl-NL',
        background: '#ffffff',
        theme_color: '#fff',
        appleStatusBarStyle: 'black-translucent',
        path: '/assets/favicon/',
        url: 'https://www.webcre8ions.com/',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/?homescreen=1',
        version: 1.0,
        logging: false,
        html: 'index.html',
        pipeHTML: true,
        replace: true,
        loadManifestWithCredentials: true,
      }),
    )
    .pipe(gulp.dest('dist/assets/favicon'))
    .on('end', reload);
}

function watchFiles() {
  gulp.watch('src/*.html', html);
  gulp.watch('src/assets/scss', css);
  gulp.watch('src/assets/js/**/*', scripts);
  gulp.watch('src/assets/fonts/**/*', fonts);
  gulp.watch('src/assets/img/**/*', images);
  gulp.watch('src/assets/favicon/**/*', favicon);
}

// define complex tasks
// const favs = gulp.series(favicon);
const js = gulp.series(scripts);

const build = gulp.series(
  gulp.parallel(css, images, fonts, html, js, polyfills),
);

const buildall = gulp.series(
  clean,
  gulp.parallel(css, images, favicon, fonts, html, js),
);

const watch = gulp.parallel(watchFiles, cacheBustTask, browserSync);

// export tasks
// exports.theme = theme
// exports.favs = favs;
exports.favicon = favicon;
exports.images = images;
exports.html = html;
exports.fonts = fonts;
exports.css = css;
exports.js = js;
exports.polyfills = polyfills;
exports.vendors = vendors;
exports.clean = clean;
exports.build = build;
exports.buildall = buildall;
exports.watch = watch;
exports.default = build;
exports.cacheBustTask = cacheBustTask;
