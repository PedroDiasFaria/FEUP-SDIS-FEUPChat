// Include Express and create a new application with Express() //
var express = require('express');
var app = express();
var jade = require('jade');
var http = require('http')
var server = http.createServer(app)
var io = require('socket.io').listen(server);
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;
var fs = require('fs');
var busboy = require('connect-busboy');
var cookieParser = require('cookie-parser')
var session      = require('express-session');

// Users that connect to the server //
var users = [];
var rooms = ['Geral','Programação','SDIS'];
var anonymousCounter = 1;

// Configure express to use jade templating for our website pages and views //
// Configure the express options to use our script.js //
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false })
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(busboy());
app.use(cookieParser())
app.use(session({ secret: 'feupchat', cookie: { maxAge: 60000 }}))

passport.use(new FacebookStrategy({
    clientID: '1497318197150610',
    clientSecret: '6afee713e78edc0c38f33f47bba75806',
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: 'read_stream' })
);

// When it gets //
app.get('/', function(req, res){
	res.render('feupchat.jade')
});

app.post('/', passport.authenticate('local', {
    successRedirect: '/feupchat',
    failureRedirect: '/'
  })
);

app.post('/upload', function(req, res){
	    var fstream;
	    req.pipe(req.busboy);
	    req.busboy.on('file', function (fieldname, file, filename) {
	        console.log("Uploading: " + filename); 
	        fstream = fs.createWriteStream(__dirname + '/files/' + filename);
	        file.pipe(fstream); 
	        fstream.on('close', function () {
	            //res.redirect('back');
	        });
	    });
});

app.get('/:file(*)', function(req, res, next){
  var file = req.params.file
    , path = __dirname + '/files/' + file;
  res.download(path);
});

passport.serializeUser(function(user, done) {
  done(null, user);
});
 
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Binds and listen to connections from the port 3000 //
server.listen(5000);//,{log:false});

// Defines messages handlers for the sockets messages //
io.sockets.on('connection', function(socket){

	socket.emit('updateRooms', rooms);
	socket.emit('updateUsers', users);

	// User joins a room //
	socket.on('joinRoom', function(roomName){
		socket.join(roomName);
		console.log("Someone just joined " + roomName);
	});

	// User leaves a room //
	socket.on('leaveRoom', function(roomName){
		socket.leave(roomName);
		socket.emit('updateRooms', rooms);
		console.log("Someone just left " + roomName);
	});

	// User creates a new room //
	socket.on('newRoom', function(roomName){
		var roomAlreadyExists = false;
		for(var i=0; i<rooms.length; i++){
			if(rooms[i] == roomName)
				roomAlreadyExists = true;
		}

		if(roomAlreadyExists == false){
			console.log("Someone just created " + roomName);
			rooms.push(roomName);
			socket.emit('updateRooms', rooms);
		}
	});

	// Get anonymous username //
	socket.on('getUsername', function(){
		socket.emit('newAnonymous', 'Anonymous' + anonymousCounter);
	});

	// Sends a private message to other client //
	socket.on('privateMessage', function(receiverName, message){
		var receiver;
		for(var i=0; i<users.length; i++){
			if(users[i].username == receiverName)
				receiver = users[i];
		}
	    io.sockets.socket(receiver.socket).emit('newPrivateMessage', socket.username, message);
	});

	// Broadcast a message to the room //
	socket.on('messageToRoom', function (room, message) {
	    socket.broadcast.to(room).emit('newRoomMessage', socket.username, room, message);
	    console.log("user " + socket.username + " send this : " + message);	    
	});

	// Adds a user to the server list //
	socket.on('addUsername', function(username){
		var name = username;
		if(username==''){
			name = "Anonymous" + anonymousCounter;
			anonymousCounter++;
		}
		socket.username = name;
		var user = {
			"username" : name,
			"socket" : socket.id
		};
		users.push(user);
		console.log(users);
		socket.join('Geral');
		socket.emit('updateUsers', users, name);
		console.log("ADDED " + name);
	});

	socket.on('askForFileToRoom', function(room, file){
		socket.broadcast.to(room).emit('sendFileToRoom', socket.username, room, file);
	    console.log("user " + socket.username + " send this : " + file);	
	});

	socket.on('askForFileToUser', function(receiverName, file){
		var receiver;
		for(var i=0; i<users.length; i++){
			if(users[i].username == receiverName)
				receiver = users[i];
		}
	    io.sockets.socket(receiver.socket).emit('sendFileToUser', socket.username, file);
	    console.log("user " + socket.username + " send this : " + file);	
	});

	// When a user disconnects //
	socket.on('disconnect', function(){
		for(var i=0; i<users.length; i++){
			if(users[i].username == socket.username)
				users.splice(i,1);
		}
	});

});

setInterval(function(){
	io.sockets.emit('updateUsers', users);
	io.sockets.emit('updateRooms', rooms);
}, 5000);

console.log('Server running at http://192.168.55.90/');
