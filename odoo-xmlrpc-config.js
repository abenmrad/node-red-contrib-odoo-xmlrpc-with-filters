module.exports = function (RED) {
    function OdooXMLRPCConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.url = n.url;
        this.db = n.db;
        this.username = n.username;
        this.password = n.password;
    }
    RED.nodes.registerType("odoo-xmlrpc-config", OdooXMLRPCConfigNode);
}
