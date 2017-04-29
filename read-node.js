module.exports = function (RED) {
    function OdooXMLRPCReadNode(config) {
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
                    var ids = msg.payload;
                    node.log('Reading ' + ids.length + ' records for model "' + config.model + '"...');
                    odoo_inst.execute_kw(config.model, 'read', [[ids]], function (err, value) {
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
    RED.nodes.registerType("odoo-xmlrpc-read", OdooXMLRPCReadNode);
};
