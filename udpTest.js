var upd = require('dgram').createSocket('udp4');

udp.on('message', 
			function(msg, remote)
			{
				console.log("Received message: " + msg + "; from " + remote.address);
			});

udp.bind(334, function()
					{
						console.log("Listening!");
					});
