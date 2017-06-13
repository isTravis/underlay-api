/* eslint-disable global-require */
/* eslint-disable no-console */

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { v1 as neo4j } from 'neo4j-driver';
import cors from 'cors';

/* -------------------------------- */
/* Initialize development variables */
/* -------------------------------- */
if (process.env.NODE_ENV !== 'production') {
	require('./config.js');
}
/* -------------------------------- */
/* -------------------------------- */

const app = express();
export default app;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const corsOptions = {
	origin: (origin, callback)=> {
		callback(null, true);
	},
	methods: 'POST, GET, PUT, DELETE, OPTIONS',
	allowHeaders: 'X-Requested-With, Content-Type',
	credentials: true,
};
app.use(cors(corsOptions));

const driver = neo4j.driver(process.env.GRAPH_DB_URI, neo4j.auth.basic(process.env.GRAPH_DB_USER, process.env.GRAPH_DB_PASSWORD));
const session = driver.session();

// Catch the browser's favicon request. You can still
// specify one as long as it doesn't have this exact name and path.
app.get('/favicon.ico', function(req, res) {
	res.writeHead(200, { 'Content-Type': 'image/x-icon' });
	res.end();
});

app.get('/pub', function(req, res) {
	session.run(`MATCH (source:Pub {title: '${req.query.title}'})-[link]-(dest) return source, link, dest`)
	.then(function(result) {
		return res.status(201).json(result);
	})
	.catch(function(error) {
		console.log(error);
	});
});

app.get('/journal', function(req, res) {
	session.run(`MATCH (source:Journal {title: '${req.query.title}'})-[link]-(dest) return source, link, dest`)
	.then(function(result) {
		return res.status(201).json(result);
	})
	.catch(function(error) {
		console.log(error);
	});
});

app.get('/person', function(req, res) {
	session.run(`MATCH (source:Person {name: '${req.query.title}'})-[link]-(dest) return source, link, dest`)
	.then(function(result) {
		return res.status(201).json(result);
	})
	.catch(function(error) {
		console.log(error);
	});
});

app.get('/test', function(req, res) {
	session.run(`MATCH (source:Person {name: 'Travis Rich'})-[link]->(dest) return source, link, dest`)
	.then(function(result) {
		return res.status(201).json(result);
	})
	.catch(function(error) {
		console.log(error);
	});
});

app.get('/test2', function(req, res) {
	const getPeople = session.run(`MATCH (source:Person) RETURN source LIMIT 5`);
	const getPubs = session.run(`MATCH (source:Pub) RETURN source LIMIT 5`);
	const getJournals = session.run(`MATCH (source:Journal) RETURN source LIMIT 5`);
	Promise.all([getPeople, getPubs, getJournals])
	.then(function(result) {
		return res.status(201).json(result);
	})
	.catch(function(error) {
		console.log(error);
	});
});

app.get('/test2', function(req, res) {
	const getPeople = session.run(`MATCH (source:Person) RETURN source LIMIT 5`);
	const getPubs = session.run(`MATCH (source:Pub) RETURN source LIMIT 5`);
	const getJournals = session.run(`MATCH (source:Journal) RETURN source LIMIT 5`);
	Promise.all([getPeople, getPubs, getJournals])
	.then(function(result) {
		return res.status(201).json(result);
	})
	.catch(function(error) {
		console.log(error);
	});
});

app.get('/search', function(req, res) {
	const searchTerm = req.query.q;
	session.run(`MATCH (n:Pub) WHERE n.title =~ '(?i).*${searchTerm}.*' OR n.description =~ '(?i).*${searchTerm}.*' RETURN n`)
	.then(function(result) {
		return res.status(201).json(result);
	})
	.catch(function(error) {
		console.log(error);
	});
});


const port = process.env.PORT || 9876;
app.listen(port, (err) => {
	if (err) { console.error(err); }
	console.info('----\n==> 🌎  API is running on port %s', port);
	console.info('==> 💻  Send requests to http://localhost:%s', port);
});
