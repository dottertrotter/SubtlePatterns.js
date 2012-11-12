
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var feedparser = require('feedparser');

var app = express();

var patterns;

var domain = "http://subtlepatternsjs.herokuapp.com/"
//var domain = "http://0.0.0.0:3001/";

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/subtlepatterns.js', function(req,res){

  var body = '';
  body += "var patterns = " + JSON.stringify(patterns) + ";";
  body += "$('body').append('<div id=\"subtlepatterns\"></div>');";
  body += "for(i = 0; i < patterns.items.length; i++){$('#subtlepatterns').append(\"<div ><img class='test-image' src='\"+patterns.items[i].src+\"' alt='\"+patterns.items[i].name+\"' title='\"+patterns.items[i].name+\"' /><a href='\"+patterns.items[i].link+\"' target='_blank'>i</a></div>\");}";
  body += "$('.test-image').click(function(e){$('html, body').css('background','url(\'+$(this).attr(\"src\")+\')');$('title').text($(this).attr(\"title\"));});";
  body += "document.write('<link rel=\"stylesheet\" type=\"text/css\" href=\""+domain+"stylesheets/subtlepatterns.css\">');"
  res.setHeader('Content-Type', 'script/javascript');
  res.setHeader('Content-Length', body.length);
  res.end(body);

});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

function splitOutUrl(content){

  var pieces = content.split("url(");
  var url = pieces[1].split(")");
  return url[0];

}

function callback (error, meta, articles){

  var items = [];

  if (error) console.error(error);
  else {
    console.log('Feed info');
    console.log('%s - %s - %s', meta.title, meta.link, meta.xmlurl);
    console.log('Articles');
    var i = 0;
    articles.forEach(function (article){
      
      var url = "";
      url = splitOutUrl(article["content:encoded"]["#"]).replace(/'/g,"");

      if(url != ""){

        items[i] = {
          "name":article.title,
          "link":article.link,
          "src":splitOutUrl(article["content:encoded"]["#"]).replace(/'/g,"")
        };

      }

      console.log(items[i])

      i++;
    });

    patterns = {
      "version":1,
      "items":items
    };

  }
}

feedparser.parseFile('./patterns.xml', callback);