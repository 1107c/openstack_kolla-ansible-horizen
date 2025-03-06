const svc = require('./service');

async function listNetworks(token, config) {
    const networkUrl = await svc.getNetworkEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${networkUrl}/v2.0/networks`, 'get', token);
    // console.log("data:", data.networks[0].subnets);

    return data.networks;
}

async function getSubnet(token, config, subnetId) {
    const networkUrl = await svc.getNetworkEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${networkUrl}/v2.0/subnets/${subnetId}`, 'get', token);

    console.log("data:", data);
    return data.subnet;
}


module.exports = { 
    listNetworks,
    getSubnet
};