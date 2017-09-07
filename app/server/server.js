require('dotenv').config()

const express = require('express')
	, bodyParser = require('body-parser')
	, passport = require('passport')
	, Auth0Strategy = require('passport-auth0')
	, massive = require('massive')
	, session = require('express-session');


const app = express()

app.use(session({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true

}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new Auth0Strategy({
	domain: process.env.AUTH_DOMAIN,
	clientID: process.env.AUTH_CLIENT_ID,
	clientSecret: process.env.AUTH_CLIENT_SECRET,
	callbackURL: process.env.AUTH_CALLBACK
}, function (accessToken, refreshToken, extraParams, profile, done) {
	
	const db = app.get('db');

	db.find_user(profile.id).then(user => {
		
		if (user[0]){
			return done(null, user);
		} else {
			db.create_user([profile.id, profile.displayName, profile.emails[0].value, profile.picture]).then( user => {
				return done(null, user[0]);
			})
		}
	})
}))

// invoked once to put user from auth on session
passport.serializeUser( function(user, done) {
	done(null,user)
})

// user comes from session and is invokeable for every endpoint on req.user
passport.deserializeUser(function(user, done){
	
	app.get('db').find_session_user(user[0].id).then( user => {
		return done(null, user[0]);
	})
})

massive(process.env.CONNECTIONSTRING).then(db => {
	app.set('db', db);
})

// ENDPOINTS
app.get('/auth', passport.authenticate('auth0'));

app.get('/auth/callback', passport.authenticate('auth0', {
	successRedirect: 'http://localhost:3000/#/private',
	failureRedirect: 'http://localhost:3000/#/',
	failureFlash: true
	
}))

app.get('/auth/me', (req,res) => {
	if(!req.user){
		return res.status(404).send('user not found');

	} else { return res.status(200).send(req.user);
	
	}
})

app.get('/auth/logout', (req,res) => {
	req.logOut() // passport gives us this to terminate a login session
	return res.redirect(302, 'http://localhost:3000/#/'); // res.redirect comes from Express. 302 is a status code for redirecting
})




let PORT = 3030;
app.listen(PORT, () => {
	console.log(`listening on port: ${PORT}`);
})