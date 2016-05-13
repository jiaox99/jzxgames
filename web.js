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

const https = require( 'https' );

app.get( '/omniLogin', 
	function( req, res )
	{
		// res.send( req.query.code );
		var aData = {
			client_id:"132a6150-0ae2-11e6-bfaa-a3d82dc1ed48",
			client_secret:"09b48944-ec96-4f07-ae16-e88352fdc0bd",
			grant_type: 'code',
			code: req.query.code
		};

		aData = JSON.stringify( aData );

		var options = {
			host : "https://account.teambition.com/oauth2/access_token",
			method : "POST",
			headers : {
				"Content-Type" : 'application/json',
				"Content-Length" : aData.length
			}
		};

		var authReq = https.request( 
			options,
		 	function( authRes )
		 	{
		 		authRes.on( 
		 			'data',
		 			function( authData )
		 			{
		 				res.send( "认证成功" + authData );
		 			}
		 		);
		 	}
		);

		authReq.write( aData + '\n');
		authReq.end();

		authReq.on( 
			'error',
			function( authError )
			{
				res.send( "认证失败" + authError );
			}
		);
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