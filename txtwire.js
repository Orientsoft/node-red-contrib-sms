module.exports = function(RED) {

    var soap = require('soap');

    function log(node, msg, text){node.log("[" + msg._msgid + "] " + text);}

    // https://api.txtwire.com/documentation_v2/class_w_s___message.html
    function TxtwireOutNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.recipient = config.recipient;
        this.message = config.message;
        this.ticket = config.ticket;

        // Retrieve the config node
        var txtwireAccount = RED.nodes.getNode(config.account);

        this.on('input', function(msg) {

            // make the input parameters available to downstream nodes
            msg.data = {
                phone: msg.recipient || node.recipient,
                message: msg.message || node.message,
                custom_ticket: msg.custom_ticket || node.ticket || new Date().getTime()
            };

            if (!msg.data.phone) {
                node.error("Missing recipient");
                return;
            }
            if (!msg.data.message) {
                node.error("Missing message");
                return;
            }

            var auth = {
                username: txtwireAccount.username,
                password: txtwireAccount.password,
                api_key: txtwireAccount.apiKey,
                code: txtwireAccount.code,
                keyword: txtwireAccount.keyword
            };
            var list = {recipients:[{recipient:{sendTo: msg.data.phone, type: 1}}]};
            var args = {
                auth: auth,
                message: msg.data.message,
                recipientList: list,
                custom_ticket: msg.data.custom_ticket,
                status_url: txtwireAccount.statusUrl
            };

            // send message via SOAP
            soap.createClient(txtwireAccount.soapWsdlUrl, function(err1, client) {
                if (err1) node.error(err1);
                else {
                    log(node, msg, "Sending message '" + args.custom_ticket + "' from " + auth.code + " to " + msg.data.phone + ": " + args.message);
                    client.sendMessage(args, function(err2, result) {
                        log(node, msg, "Received SOAP response for message '" + result.sendMessageReturn.custom_ticket.$value + "'");
                        if (err2) node.error(err);
                        else {
                            // store the results in the message payload
                            msg.payload = result;
                            // forward the message
                            node.send(msg);
                        }
                    });
                }
            });
        });

        this.on("close", function() {
        });
    }
    RED.nodes.registerType("txtwire-out", TxtwireOutNode);
};
