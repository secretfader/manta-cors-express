/**
 * manta-cors-express
 * (C) Copyright 2014 Nicholas Young
 * Please see the accompanying LICENSE document, or visit
 * http://github.com/nicholaswyoung/manta-cors/express.
 */

var fs 		 = require('fs')
, 	assert  = require('assert')
, 	express = require('express')
, 	manta 	= require('manta')
, 	mime 	 = require('mime')
, 	app 	  = express()
, 	options = {}
, 	client;

client = manta.createClient({
	sign: manta.privateKeySigner({
		key: fs.readFileSync(process.env.HOME + '/.ssh/id_rsa', 'utf8'),
		keyId: process.env.MANTA_KEY_ID,
		user: process.env.MANTA_USER
	}),
	user: process.env.MANTA_USER,
	url: process.env.MANTA_URL
});

/**
 * Setup the storage directory, and access control headers.
 */
options.directory = '/' + process.env.MANTA_USER + '/stor/demo';
options.cors = {
	headers: {
		'access-control-allow-headers': 'access-control-allow-origin, accept, origin, content-type',
		'access-control-allow-methods': 'PUT,GET,HEAD,DELETE',
		'access-control-allow-origin': '*'
	}
};

/**
 * Setup Express.js
 */
app.configure(function () {
	app.set('view engine', 'jade');
	app.use(express.logger());
	app.use(express.static('./public'));
	app.use(express.urlencoded());
	app.use(app.router);
	app.use(express.errorHandler());
});

/**
 * Routes
 */
app.get('/', function (req, res) {
		res.render('index');
});

app.post('/sign', function (req, res, next) {
	var _options = {
		expires: new Date().getTime() + (3600 * 1000),
		path: [options.directory, req.param('file')].join('/'),
		method: ['OPTIONS', 'PUT', 'GET']
	};
	client.signURL(_options, function (err, signature) {
		if (err) return next(err);
		res.json({
			url: process.env.MANTA_URL + signature,
			content_type: mime.lookup(req.param('file'))
		});
	})
});

/**
 * Create storage directory on boot.
 */
client.mkdirp(options.directory, options.cors, function (err) {
	assert.ifError(err);
	app.listen(3000);
});
