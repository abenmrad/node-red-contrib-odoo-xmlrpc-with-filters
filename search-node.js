module.exports = function (RED) {
    function OdooXMLRPCSearchNode(config) {
        RED.nodes.createNode(this, config);
        var Odoo = require('odoo-xmlrpc');
        var url = require('url');
        this.host = RED.nodes.getNode(config.host);
        var node = this;
        try {
            node.on('input', function (msg) {
                var odoo_inst = new Odoo({
                    url: this.host.url,
                    db: this.host.db,
                    username: this.host.username,
                    password: this.host.password,
                });
                odoo_inst.connect(function (err) {
                    if (err) {
                        node.log(err.body);
                        node.status({fill: "red", shape: "dot", text: err.message});
                        node.error(err.message);
                        return;
                    }
                    node.log('Connected to Odoo server.');
                    var inParams = [];
                    inParams.push([]);
                    var params = [];
                    params.push(inParams);
                    node.log('Searching for model "' + config.model + '"...');
                    odoo_inst.execute_kw(config.model, 'search', params, function (err, value) {
                        if (err) {
                            node.log(err.body);
                            node.status({fill: "red", shape: "dot", text: err.message});
                            node.error(err.message);
                            return;
                        }
                        msg.payload = value;
                        node.send(msg);
                    });
                });
            });
        } catch (err) {
            node.status({fill: "red", shape: "dot", text: err.message});
            node.error(err.message);
        }
    }
    RED.nodes.registerType("odoo-xmlrpc-search", OdooXMLRPCSearchNode);
};
