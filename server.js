var path        = require('path'),
    fs          = require('fs'),
    express     = require('express'),
    browserSync = require('browser-sync'),
    nunjucks    = require('express-nunjucks'),
    _           = require('underscore'),
    routes      = require(__dirname + '/app/routes.js'),
    favicon     = require('serve-favicon'),
    app         = express(),
    port        = process.env.PORT || 3000,
    env         = process.env.NODE_ENV || 'development';

/*
  Load all the project data from the files.
*/
var t = fs.readdirSync(__dirname + '/lib/projects/');
app.locals.data = [];
_.each(t,function(el) {
  var file = fs.readFileSync(__dirname + '/lib/projects/'+el).toString();
  try {
    var json = JSON.parse(file);
    app.locals.data.push(json);
  } catch(err) {
    console.log(err);
  }  
});

// Application settings
app.set('view engine', 'html');
app.set('views', [__dirname + '/app/views', __dirname + '/lib/']);

// Middleware to serve static assets
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_template/assets'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit'));
app.use('/public/images/icons', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit/images'));

nunjucks.setup({
    autoescape: true,
    watch: true
}, app);

// Elements refers to icon folder instead of images folder
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images','favicon.ico')));

// send assetPath to all views
app.use(function (req, res, next) {
  // res.locals.assetPath="/public/";
  res.locals.asset_path="/public/";
  next();
});

// routes (found in app/routes.js)
if (typeof(routes) != "function"){
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.")
  routes.bind(app);
} else {
  app.use("/", routes);
}

// auto render any view that exists
app.get(/^\/([^.]+)$/, function (req, res) 
{
  console.log('default');
	var path = (req.params[0]);
	res.render(path, function(err, html) {
		if (err) {
			res.render(path + "/index", function(err2, html){
        if (err2) {
          console.log(err);
          res.status(404).send(err).send(err2);
        } else {
          res.end(html);
        }
      });
		} else {
			res.end(html);
		}
	});
});

// start the app
if (env === 'production') {
  app.listen(port);
} else {
  // for development use browserSync as well
  app.listen(port,function()
  {
    browserSync({
      proxy:'localhost:'+port,
      files:['public/**/*.{js,css}','app/views/**/*.html'],
      ghostmode:{clicks:true, forms: true, scroll:true},
      open:false,
    });
  });
}

console.log('');
console.log('Listening on port ' + port);
console.log('');