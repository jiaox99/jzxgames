/**
 * Created by Administrator on 14-5-27.
 */
var net = require( "net" );
//var server = net.createServer();
//server.listen( 12366 );
//server.on(
//    "connection",
//    function( socket )
//    {
//        socket.write( "From server" );
//    }
//);

var dataCenter = {};

dataCenter.getInstance = function()
{

};

var Client = function()
{
    console.log( "A new client!" );
    this.dataBuffer = null;     //数据缓存
    this.readingLengthen = 0;//准备读取的数据总长度
    this.accType = -1;//可授受的消息类型
    this.srcType = -1;//自己的消息类型
    this.offset = 0;    //正在读取的数据偏移
};

Client.prototype.initWith = function( socket )
{
    this.socket = socket;
    this.socket.on( "data", dataCenter.onData );
    this.socket.on( "close", dataCenter.onClose );
};

Client.prototype.onClose = function( had_error )
{
    console.log( "Client closed!" );

    var i = dataCenter.allClient.indexOf( this );
    if ( i != -1 )
    {
        dataCenter.allClient.splice( i, 1 );
    }
    i = dataCenter.allSockets.indexOf( this.socket );
    if ( i != -1 )
    {
        dataCenter.allSockets.splice( i, 1 );
    }
};

dataCenter.onData = function( data )
{
    console.log( "Ondata-----------------------------------------------" );
    var i = dataCenter.allSockets.indexOf( this );
    console.log( "Socket index->", i );
    if ( i != -1 )
    {
        var client = dataCenter.allClient[i];
        console.log( "________________________________________________>>>>>>", data );
        client.onData( data );
    }
};

dataCenter.onClose = function( had_error )
{
    var i = dataCenter.allSockets.indexOf( this );
    console.log( i );
    if ( i != -1 )
    {
        var client = dataCenter.allClient[i];
        client.onClose( had_error );
    }
};

Client.prototype.onData = function( data )
{
    console.log( "Receive data", data );
    if ( this.dataBuffer == null )
    {
        this.dataBuffer = data;
    }
    else
    {
        this.dataBuffer = Buffer.concat( [this.dataBuffer, data] );
    }
    console.log( "Befor handling data", this.dataBuffer );

    while ( this.dataBuffer && this.dataBuffer.length >= 4 )
    {
        console.log( "handling data", this.dataBuffer );
        if ( this.srcType == -1 )
        {
            this.srcType = this.dataBuffer.readInt8( 0 );
            this.accType = this.dataBuffer.readInt8( 1 );
            dataCenter.litenOnType( this.accType, this );

            this.dataBuffer = this.dataBuffer.slice( 2 );
            continue;
        }

        console.log( "Reading len->>>", this.readingLengthen );
        if ( this.readingLengthen == 0 )
        {
            this.readingLengthen = this.dataBuffer.readUInt32BE( 0 );
            this.dataBuffer = this.dataBuffer.slice( 4 );
            console.log( "Read len->>>", this.readingLengthen );
            console.log( "After Read len data>>>", this.dataBuffer );
            continue;
        }


        console.log( "Reading len->>>", this.readingLengthen, "Data len:---->", this.dataBuffer.length );

        if ( this.readingLengthen <= this.dataBuffer.length )
        {
            var sData = this.dataBuffer.slice( 0, this.readingLengthen );
            this.dataBuffer = this.dataBuffer.slice( this.readingLengthen );
            this.readingLengthen = 0;
            dataCenter.broadcast( this.srcType, sData );
        }
    }
};

//Client.prototype.socket.on( "data", Client.prototype.onData );

Client.prototype.sendData = function( data )
{
    console.log( "Sengding data------------------->", data );
    this.socket.write( new Buffer( [0x0, 0x0, 0x0, 0x4] ) );
    this.socket.write( data );
};

dataCenter.startServer = function( port )
{
    if ( dataCenter.server )
    {
        console.log( "Server has runing!" );
        return;
    }
    dataCenter.sockets = [];
    dataCenter.allSockets = [];
    dataCenter.allClient = [];
    dataCenter.server = net.createServer();
    dataCenter.server.listen( port );
    dataCenter.server.on( "connection", dataCenter.onConnection );

    console.log( "Socket server started!" );
};

dataCenter.onConnection = function( socket )
{
    dataCenter.allSockets.push( socket );
    var client = new Client();
    dataCenter.allClient.push( client );
    client.initWith( socket );
};

dataCenter.broadcast = function( type, data )
{
    var clients = dataCenter.sockets[type];
    if ( clients && clients.length > 0 )
    {
        for ( var i in clients )
        {
            var client = clients[i];
            client.sendData( data );
        }
    }
};

dataCenter.litenOnType = function( type, client )
{
    if ( dataCenter.sockets[type] == null )
    {
        dataCenter.sockets[type] = [];
    }

    dataCenter.sockets[type].push( client );
};

dataCenter.unlistenOnType = function( type, client )
{
    var clients = dataCenter.sockets[type];
    if ( clients )
    {
        var i = clients.indexOf( client );
        if ( i != -1 )
        {
            clients.splice( i, 1 );
        }
    }
};

module.exports = dataCenter;