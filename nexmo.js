module.exports = function(RED) {

    var querystring = require('querystring');
    var https = require('https');
    var http = require('http');

    function log(node, msg, text){node.log("[" + msg._msgid + "] " + text);}

    function NexmoOutNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.from = config.from;
        this.to = config.to;
        this.message = config.message;
        this.ref = config.ref;
        this.ssl = config.protocol === "https";

        // Retrieve the config node
        var nexmoAccount = RED.nodes.getNode(config.account);

        this.on('input', function(msg) {

            // make the input parameters available to downstream nodes
            msg.data = {
                from: msg.from || node.from || nexmoAccount.from,
                to: msg.to || node.to,
                text: msg.message || node.message,
                'client-ref': msg.clientRef || node.ref || new Date().getTime()
            };

            if (!msg.data.from) {
                node.error("Missing sender");
                return;
            }
            if (!msg.data.to) {
                node.error("Missing recipient");
                return;
            }
            if (!msg.data.text) {
                node.error("Missing message");
                return;
            }

            var up = { username: nexmoAccount.apiKey, password: nexmoAccount.apiSecret};
            var msgpath = '/sms/json?' + querystring.stringify(up);

            var reqOptions = {
                host: "rest.nexmo.com",
                port: node.ssl ? 443 : 80,
                path: msgpath + '&' + querystring.stringify(msg.data),
                method: 'GET',
                headers: {
                    'Content-Type':'application/x-www-form-urlencoded',
                    'Content-Length': 0,
                    'Accept':'application/json'
                }
            };

            // send message via REST
            log(node, msg, "Sending message '" + msg.data['client-ref'] + "' from " + msg.data.from + " to " + msg.data.to + ": " + msg.data.text);
            var nexmoReq = (node.ssl ? https : http).request(reqOptions, function(nexmoRes) {
                var data = [];
                nexmoRes.setEncoding('utf8');
                nexmoRes.on('data', function (chunk) {
                    data.push(chunk);
                });
                nexmoRes.on('close', function (error) {
                    if (error) node.error(error);
                });
                nexmoRes.on('end', function() {
                    var rawMessage = data.join("");
                    try {
                        msg.payload = (data.length > 0 ? JSON.parse(rawMessage) : {});
                        log(node, msg, "Received REST response for message '" + (msg.payload.messages ? msg.payload.messages[0]['client-ref'] : 'N/A') + "'");
                    } catch (parsererr) {
                        node.error(parsererr);
                        msg.payload = {
                            error: parsererr,
                            body: rawMessage,
                            messages:[{
                                'client-ref': msg.data['client-ref']
                            }]
                        };
                    }
                    node.send(msg);
                });

            });
            nexmoReq.on('error', function(e) {
                if (e) node.error(e);
            });
            nexmoReq.end();
        });

        this.on("close", function() {
        });
    }
    RED.nodes.registerType("nexmo-out", NexmoOutNode);
};
