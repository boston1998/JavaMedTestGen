// Get required modules
// Express
var express = require('express')();
var app = require('http').Server(express);
// UDP datagram module for talking with remote clients
var dgram = require('dgram');
// Create UDP controller
var udp = dgram.createSocket('udp4');
// FS
var fs = require('fs');
// Socket
var io = require('socket.io')(app);
// Child process
var spawn = require('child_process').spawn;
// IP Stuff
var ip = require('ip');

// Current address being scanned and index (last octet)
var ipIndex = 0;
var curAddr = ip.address().slice(0, ip.address().lastIndexOf('.') + 1) + ipIndex;

// Ports and ip configuration
var localPort = 333; // For local socket connection
var remotePort = 334; // For remote UDP communication
var localIp = 'localhost'; // For local socket connection
// All clients
var allClients = [];

// Client object
function Client(nam, id, ip)
{
	this.nam = nam;
	this.id = id;
	this.ip = ip;

	this.getNam = function() {return this.nam;};
	this.getId = function() {return this.id;};
	this.getSocket = function() {return this.udpSocket;};
	this.getIp = function() {return this.ip;};
	
	this.send = function(data) 
					{
						// Make sure data is under maximum UDP packet size
						if(data.length < 65535)
						{
							udp.send(data, 0, data.length, remotePort, ip);
						}
						// If not, break it up and send separate chunks
						else
						{
							// Parse data
							var m = JSON.parse(data);
							// Break up packet
							var part1 = m.data.slice(0, m.data.length / 2);
							var part2 = m.data.slice(part1.length, m.data.length);
							// Re-stringify and send parts
							this.send(JSON.stringify({data: part1, count: 2 * m.count}));
							this.send(JSON.stringify({data: part2, count: 2 * m.count}));
						}
					};
	// Register this
	allClients.push(this);
}

// URL request processing
express.get('/controlpanel', 
			function(req, res)
			{
				res.sendFile(__dirname + "/cp.html");
			});

// UDP message callback
udp.on('message',
			function(msg, remote)
			{
				// TODO
				// If this is a student response
				if(msg.data.student)
				{
					// Create a new student object
					var stu = new Client(msg.data.nam, remote.address, msg.data.id);
				}

				// If it is a submission, copy it over to a file (probly in JSON format for easy processing)
				// Otherwise do other things
			});					

// Set the scanner to scan every now and then (50 milliseconds) for new clients
setTimeout(function()
				{
					// Send our selected address a message
					var m = "r u student?";
					udp.send(m, 0, m.length, remotePort, curAddr);
					// Set up next IP
					ipIndex ++;
					// We'll assume this is a class C network and only cycle through the last octet
					if(ipIndex >= 254)
						ipIndex = 0;
					// Set the last octet. In 50 milliseconds, the new address will get messaged
					curAddr = curAddr.slice(0, curAddr.lastIndexOf('.') + 1) + ipIndex;
				}, 50);


// Set up local socket connection (to teacher control panel)
io.on('connection', 
		function(socket)
		{
			// Local socket callbacks - for communicating with teacher control panel

			// Send file callback - send particular file to particular client
			// Broadcast file callback - send one file to everyone
			// Save scenario callback - save scenario file
			// Read folder callback - read and output ALL the scenario files
			// Grade assignment callback - ?
			// Close callback - cleanly close the html
			// Disconnect callback - reopen browser to control panel
			socket.on('disconnect',
							function()
							{
									// Lmaoz user trapping
									//spawn('explorer', ["http://localhost:" + port + "/controlpanel"]);
							});
		});



// Listen for local connection (from html control panel)
app.listen(localPort, localIp, function(){
		     console.log('Awaiting local connection on ' + localIp + ':' + localPort);
		     });
// Listen for UDP messages from clients
udp.bind(remotePort, function(){
							console.log('Listening on ' + remotePort);
						 });
// Open client browser to control panel
spawn('explorer', ["http://localhost:" + localPort + "/controlpanel"]);
