require('dotenv').config()

const express = require('express')
	, bodyParser = require('body-parser')
	, passport = require('passport')
	, auth0Strategy = require('passport-auth0')
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
passport.use(auth0Strategy)


massive(process.env.CONNECTIONSTRING).then( db => {
	app.set('db',db);
})
console.log(process.env.TEST)


let PORT = 3030;
app.listen(PORT, () => { console.log(`listening on port: ${PORT}`);
})