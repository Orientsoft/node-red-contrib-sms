module.exports = function(RED) {

    function NexmoConfigNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        this.name = config.name;
        this.apiKey = this.credentials.apiKey;
        this.apiSecret = this.credentials.apiSecret;
        this.from = config.from;

        node.log('Initialized Nexmo library for api key ' + this.apiKey);

    }
    RED.nodes.registerType("nexmo-config", NexmoConfigNode, {
        credentials: {
            apiKey: {type:"text"},
            apiSecret: {type:"text"}
        }
    });
};
