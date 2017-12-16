function isDefinedValue(v){
  return !(v == null || typeof v === 'undefined');
}

function isUInt(v){
  return typeof v === 'number' && Math.floor(v) === v && v >= 0;
}

module.exports = function (RED) {
    var handle_error = function(err, node) {
        node.log(err.body);
        node.status({fill: "red", shape: "dot", text: err.message});
        node.error(err.message);
    };

    function OdooXMLRPCSearchReadNode(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.host);
        var node = this;

        node.on('input', function (msg) {
            node.status({});
            this.host.connect(function(err, odoo_inst) {
                if (err) {
                    return handle_error(err, node);
                }

                var offset = msg.offset;
                if (isDefinedValue(offset) && !isUInt(offset)){
                  return handle_error(new Error('When offset is provided, it must be a positive integer number'), node);
                }
                var limit = msg.limit;
                if (isDefinedValue(limit) && !isUInt(limit)){
                  return handle_error(new Error('When limit is provided, it must be a positive integer number'), node);
                }

                var inParams;
                if (msg.filters){
                  if (!Array.isArray(msg.filters)){
                    return handle_error(new Error('When filters is provided, it must be an array'), node);
                  }
                  inParams = msg.filters;
                } else {
                  inParams = [];
                  inParams.push([]);
                }
                var params = [];
                params.push(inParams);
                //node.log('Search-reading for model "' + config.model + '"...');
                odoo_inst.execute_kw(config.model, 'search_read', params, function (err, value) {
                    if (err) {
                        return handle_error(err, node);
                    }

                    if (isDefinedValue(offset)){
                      //Jump the x first elements (where x has the value of the "offset" variable)
                      value = value.slice(offset);
                    }
                    if (isDefinedValue(limit)){
                      //Limit the length of the value array to x elements (where x has the value of the "limit" variable)
                      value = value.slice(0, limit);
                    }
                    msg.payload = value;
                    node.send(msg);
                });
            });
        });
    }
    RED.nodes.registerType("odoo-xmlrpc-search-read", OdooXMLRPCSearchReadNode);
};
