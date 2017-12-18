module.exports = function (RED) {
    var handle_error = function(err, node) {
        node.log(err.body);
        node.status({fill: "red", shape: "dot", text: err.message});
        node.error(err.message);
    };

    function OdooXMLRPCUpdateNode(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.host);
        var node = this;

        node.on('input', function (msg) {
            node.status({});
            this.host.connect(function(err, odoo_inst) {
                if (err) {
                    return handle_error(err, node);
                }

                var inParams;
                if (msg.payload){
                  if (!Array.isArray(msg.payload)){
                    return handle_error(new Error('when defined, msg.payload must be an array'), node);
                  }
                  inParams = msg.payload
                } else {
                  inParams = [];
                  inParams.push([]);
                }

                var params = [];
                params.push(inParams);
                //node.log('Creating object for model "' + config.model + '"...');
                odoo_inst.execute_kw(config.model, 'write', params, function (err, value) {
                    if (err) {
                        return handle_error(err, node);
                    }
                    msg.payload = value;
                    node.send(msg);
                });
            });
        });
    }
    RED.nodes.registerType("odoo-xmlrpc-update", OdooXMLRPCUpdateNode);
};
