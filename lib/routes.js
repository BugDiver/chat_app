module.exports = function(app,io,passport,Strategy){
	passport.use(new Strategy({
	    clientID: process.env.CHAT_ID,
	    clientSecret: process.env.CHAT_SECRET,
	    callbackURL: 'http://localhost:8080/login/facebook/return'
	  },function(accessToken, refreshToken, profile, cb) {
	    return cb(null, profile);
	}));

	passport.serializeUser(function(user, cb) {
	  cb(null, user);
	});

	passport.deserializeUser(function(obj, cb) {
	  cb(null, obj);
	});


	app.get('/', function(req, res){
		res.render('home');
	});
	app.get('/create' ,passport.authenticate('facebook'));

	app.get('/login/facebook/return',passport.authenticate('facebook', { failureRedirect: '/' }),function(req, res) {
    	res.redirect('/profile');
	});

	app.get('/profile',require('connect-ensure-login').ensureLoggedIn(),function(req, res){
		var id = req.user.id.replace(/\s/gi ,"").toLowerCase();
    	res.redirect('/chat/'+id);
  	});
  	app.get('/chat/:id',function(req, res){
    	res.render('chat')

  	});

  	var chat = io.of('/socket').on('connection', function (socket) {
  			socket.on('load',function(data){
  				if(chat.clients(data).length === 0 ) {
  					socket.emit('peopleinchat', {number: 0});
  				}
  				else if(chat.clients(data).length === 1) {
  					socket.emit('peopleinchat', {
  						number: 1,
  						user: chat.clients(data)[0].username,
  						id: data
  					});
  				}
  				else if(chat.clients(data).length >= 2) {
  					chat.emit('tooMany', {boolean: true});
  				}
  			});
  			socket.on('login', function(data) {
  				if(chat.clients(data.id).length < 2){
  					socket.username = data.user;
  					socket.room = data.id;
  					socket.join(data.id);
  					if(chat.clients(data.id).length == 2) {
  						var usernames = [];
  						usernames.push(chat.clients(data.id)[0].username);
  						usernames.push(chat.clients(data.id)[1].username);
  						chat.in(data.id).emit('startChat', {
  							boolean: true,
  							id: data.id,
  							users: usernames,
  						});
  					}
  				}
  				else {
  					socket.emit('tooMany', {boolean: true});
  				}
  			});
  			socket.on('disconnect', function() {
  				socket.broadcast.to(this.room).emit('leave', {
  					boolean: true,
  					room: this.room,
  					user: this.username,
  				});
  				socket.leave(socket.room);
  			});
  			socket.on('msg', function(data){
  				socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
  			});
  		});	
};
