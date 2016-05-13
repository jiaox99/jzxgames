// web.js
var express = require("express");
var logfmt = require("logfmt");
var dataCenter = require( "./app/dataCenter" );
var app = express();

var td = require( "./routes/td" );
app.get( "/td", td.list );

app.use(logfmt.requestLogger());
app.use(express.static(__dirname + '/public'));
app.set( "views", "./views" );
app.set( "view engine", 'jade' );

app.get( '/omni', 
	function( req, res )
	{
		res.render( "omni", { title:"Hello, OmniPlan" } );
	}
 );

app.get( '/omniLogin', 
	function( req, res )
	{
		res.send( req.query.code );
	}
);

app.get('/', function(req, res) {
  res.send('Hello World, 这是中国！');
});

//app.

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

//dataCenter.startServer( 5001  );