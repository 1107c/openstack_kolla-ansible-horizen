const svc = require('./service');

async function listNetworks(token, config) {
    const networkUrl = await svc.getNetworkEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${networkUrl}/v2.0/networks`, 'get', token);
    console.log("data: ",data);

    return data.networks;
}

module.exports = { 
    listNetworks 
};