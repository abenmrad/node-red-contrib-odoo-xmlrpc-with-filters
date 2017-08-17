module.exports = function (RED) {
    var handle_error = function(err, node) {
        node.log(err.body);
        node.status({fill: "red", shape: "dot", text: err.message});
        node.error(err.message);
    };

    function OdooXMLRPCReadNode(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.host);
        var node = this;

        node.on('input', function (msg) {
            node.status({});
            this.host.connect(function(err, odoo_inst) {
                if (err) {
                    return handle_error(err, node);
                }

                var ids = msg.payload;
                //node.log('Reading ' + ids.length + ' records for model "' + config.model + '"...');
                odoo_inst.execute_kw(config.model, 'read', [[ids]], function (err, value) {
                    if (err) {
                        return handle_error(err, node);
                    }
                    msg.payload = value;
                    node.send(msg);
                });
            });
        });
    }
    RED.nodes.registerType("odoo-xmlrpc-read", OdooXMLRPCReadNode);
};
