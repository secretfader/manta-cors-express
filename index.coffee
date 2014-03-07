fs 		 = require('fs')
assert  = require('assert')
express = require('express')
manta 	= require('manta')
app 	  = express()

client = manta.createClient
	sign: manta.privateKeySigner
		key: fs.readFileSync(
			"#{process.env.HOME}/.ssh/id_rsa", 'utf8'
		),
		keyId: process.env.MANTA_KEY_ID,
		user: process.env.MANTA_USER
	user: process.env.MANTA_USER,
	url: process.env.MANTA_URL

base = "/#{process.env.MANTA_USER}/stor/demo"

options =
	headers:
		'access-control-allow-headers': 'access-control-allow-origin, accept, origin, content-type',
		'access-control-allow-methods': 'PUT,GET,HEAD,DELETE',
		'access-control-allow-origin': '*'

app.configure ->
	app.set 'view engine', 'jade'
	app.use express.logger()
	app.use express.static('./public')
	app.use express.urlencoded()
	app.use express.cookieParser()
	app.use app.router
	app.use express.errorHandler()

app.get '/', (req, res) ->
	res.render 'index'

app.post '/sign', (req, res, next) ->
	opts =
		expires: new Date().getTime() + (3600 * 1000)
		path: "#{base}/#{req.param('file')}"
		method: ['OPTIONS', 'PUT']
	client.signURL opts, (err, signature) ->
		return next(err) if err
		url =
			url: process.env.MANTA_URL + signature
		res.json(url)

client.mkdirp base, options, (err) ->
	assert.ifError(err);
	console.log(err) if err
	app.listen(3000)
