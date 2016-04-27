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
// Routing stuff for figuring network IPs and whatnot for poking
var router = require('network');

// Current address being scanned and index (last octet)
var ipIndex = 0;
// This is the default gateway
var gateway = '10.36.6.0';
// This is the address we will be poking - will change every time
var curAddr = gateway.slice(0, gateway.lastIndexOf('.') + 1) + ipIndex;
// Socket connection to local user
var teacher = false;
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
							this.send(JSON.stringify({'data' : part1, 'part' : data.part, 'count' : 2 * m.count}));
							this.send(JSON.stringify({'data' : part2, 'part' : data.part + 1, 'count' : 2 * m.count}));
						}
					};
	// Register this
	allClients.push(this);
}

// Student finder
function findStuById(id)
{
	for(var i = 0; i < allClients.length; i ++)
		if(allClients[i].getId() === id)
			return allClients[i];
	return false;
}

// URL request processing
express.get('/menu.html', 
				function(req, res)
				{
					res.sendFile(__dirname + "/html/menu.html");
				});
express.get('/teacher.html', 
				function(req, res)
				{
					res.sendFile(__dirname + "/html/teacher.html");
				});
express.get('/menu.css',
				function(req, res)
				{
					res.sendFile(__dirname + "/css/menu.css");
				});
express.get('/teacher.css',
				function(req, res)
				{
					res.sendFile(__dirname + "/css/teacher.css");
				});

// UDP message callback
udp.on('message',
			function(msg, remote)
			{
				// TODO
				// See if the message contains any data at all
				if(msg.data)
				{
					// If this is a student response
					if(msg.data.student)
					{
						// Create a new student object
						var stu = new Client(msg.data.nam, remote.address, allClients.length);
					}

				// If it is a submission, copy it over to a file (probly in JSON format for easy processing)
				}
				// Otherwise do other things

				console.log("Got message: " + msg);
			});					

// Set the scanner to scan every now and then (50 milliseconds) for new clients
setInterval(function()
				{
					if(curAddr)
					{
						// Send our selected address a message
						var m = "r u student?";
						console.log('Poking ' + curAddr);
						udp.send(m, 0, m.length, remotePort, curAddr);
						// Set up next IP
						ipIndex ++;
						// We'll assume this is a class C network and only cycle through the last octet
						if(ipIndex >= 256)
							ipIndex = 0;
						// Set the last octet. In 50 milliseconds, the new address will get messaged
						curAddr = curAddr.slice(0, curAddr.lastIndexOf('.') + 1) + ipIndex;
					}
				}, 1);


// Set up local socket connection (to teacher control panel)
io.on('connection', 
		function(socket)
		{
			// Local socket callbacks - for communicating with teacher control panel
			teacher = socket;
			// Send file callback - send particular file to particular client
			teacher.on('send',
							function(file, studentId)
							{
								// Make sure file is accessible
								fs.access(file, fs.R_OK, 
												function(err)
												{
													if(!err)
													{
														// File is okay, send it
														var data = fs.readFileSync(file, ['UTF8', 'r']);
														var stu = findStuById(studentId);
														if(stu)
															stu.send(JSON.stringify({'data' : data, 'part' : 1, 'count' : 1}));
													}
												});
							});
			// Broadcast file callback - send one file to everyone
			teacher.on('broadcast',
							function(file)
							{
								// Make sure file is accessible
								fs.access(file, fs.R_OK, 
												function(err)
												{
													if(!err)
													{
														var data = fs.readFileSync(file, ['UTF8', 'r']);
														// File is okay, send it
														allClients.forEach(function(stu, i, arr)
																					{
																						stu.send(JSON.stringify({'data' : data, 'part' : 1, 'count' : 1}));
																					});
													}
												});
							});
			// Save scenario callback - save scenario file
			// Read folder callback - read and output ALL the scenario files
			// Grade assignment callback - ?
			// Close callback - cleanly close the html
			// Disconnect callback - reopen browser to control panel
			socket.on('disconnect',
							function()
							{
									// Teacher no longer exists, await reconnection
									teacher = false;
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
spawn('explorer', ["http://localhost:" + localPort + "/menu.html"]);
