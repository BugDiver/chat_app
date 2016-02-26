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
		var name = req.user.displayName
    	res.redirect('/chat/'+name);
  	});
  	app.get('/chat/:name',function(req, res){
    	res.render('chat')

  	});
};
