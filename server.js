"use strict";

const http = require("http");
const url = require("url");
const querystring = require("querystring");
const path = require("path");
const fs = require("fs");

function serve(directory, port) {
    let server = new http.Server();
    server.listen(port);
    console.log("Listening on port", port);

    server.on("request", (request, response) => {
	let parsed_url = url.parse(request.url);
	let filename = parsed_url.pathname;
	filename = path.resolve(directory, filename.substring(1)
				.replace(/\.\.\//g, ""));
	let type;
	switch(path.extname(filename)) {
	case ".html":
	    type = "text/html";
	    break;
	case ".js":
	    type = "text/javascript";
	    break;
	case ".css":
	    type = "text/css";
	    break;
	case ".ico":
	    type = "image/ico";
	    break;
	case ".json":
	    type = "application/json";
	    break;
	default:
	    console.log("unknown file type: " + filename);
	    type = "application/octet-stream";
	    break;
	}
	let stream = fs.createReadStream(filename);
	stream.once("readable", () => {
	    response.setHeader("Content-Type", type);
	    response.writeHead(200);
	    stream.pipe(response);
	});

	stream.on("error", (err) => {
	    response.setHeader("Content-Type", "text/plain; charset=UTF-8");
	    response.writeHead(404);
	    response.end(err.message);
	});
    });
}

serve(process.cwd(), parseInt(process.argv[2]) || 80);
