module.exports = function(RED) {

    function TxtwireConfigNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        this.name = config.name;
        this.username = this.credentials.username;
        this.password = this.credentials.password;
        this.apiKey = this.credentials.apiKey;
        this.code = config.code;
        this.keyword = config.keyword;
        this.statusUrl= config.statusUrl;

        this.soapWsdlUrl = "http://api.txtwire.com/webservices/?version=2.0.0&wsdl";
        this.ERROR_MESSAGES = {
            sender: 'Invalid from address',
            to: 'Invalid to address',
            msg: 'Invalid Text Message',
            countrycode: 'Invalid Country Code',
            msisdn: 'Invalid MSISDN passed',
            body: 'Invalid Body value in Binary Message',
            udh: 'Invalid udh value in Binary Message',
            title: 'Invalid title in WAP Push message',
            url: 'Invalid url in WAP Push message'
        };

        node.log('Initialized Txtwire library for user ' + this.username);

    }
    RED.nodes.registerType("txtwire-config", TxtwireConfigNode, {
        credentials: {
            username: {type:"text"},
            password: {type:"password"},
            apiKey: {type:"text"}
        }
    });
};
