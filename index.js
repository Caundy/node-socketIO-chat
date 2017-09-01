//Express initializes app to be a function handler that you can supply to an HTTP server (as seen in line 2)
var app = require('express')();
//http server object
var http = require('http').Server(app);
//we initialize new instance of socket by passing it the http server object
var io = require('socket.io')(http);

//full function: 
//io = require('socket.io')(require('http').Server(require('express')()))

//We define a route handler / that gets called when we hit our website home
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/history', function(req, res){
    res.sendFile(__dirname + '/history.html');
});

//setting those arrays here to mock dbs and make them semi-permanent (recreated at each script start)
let activeUsers = [];
let msgHistory = [];

//setting some event listeners when some connection has been established
io.on('connection', function(socket){

    //adding newly connected socket to the array and welcoming it to the chat
    activeUsers.push(socket);

    //send a welcome message to the last socket in the array (the one that joined)
    activeUsers[activeUsers.length-1].emit('chat message', `welcome to the chat, socket #${socket.id}`);

    //notify all that someone connected
    io.emit('chat message', `${socket.id} just joined the chat :)`);

    //handling chat messages - on chat msg -> emit chat msg
    socket.on('chat message', function(msg){
        //adding msg to history
        msgHistory.push(`#${socket.id}: ${msg}`);
        //emitting msg to all sockets
        io.emit('chat message', `#${socket.id} wrote: ${msg}`);
        //resend the history to people connected at srvraddr/history due to a new message appearing
        io.emit('history sent', msgHistory);

    });

    //send msgHistory to someone viewing the srvraddr/history
    socket.on('viewing history', function(){
        io.emit('history sent', msgHistory);
    })
    
    //notify when a socket drops connection
    socket.on('disconnect', function(reason){
        io.emit('chat message', `Socket #${socket.id} just disconnected due to ${reason}`)
    })

});

//We make the http server listen on port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});