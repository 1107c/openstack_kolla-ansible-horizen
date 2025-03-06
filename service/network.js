const svc = require('./service');

async function listNetworks(token, config) {
    const networkUrl = await svc.getNetworkEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${networkUrl}/v2.0/networks`, 'get', token);

    return data.networks;
}

async function getSubnet(token, config, subnetId) {
    const networkUrl = await svc.getNetworkEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${networkUrl}/v2.0/subnets/${subnetId}`, 'get', token);

    // console.log("data:", data);
    return data.subnet;
}

const createNetwork = async (token, config, networkData) => {
    try {
        const networkUrl = await svc.getNetworkEndpoint(token.catalog, config.region);
        const requestData = {
            network: {
                name: networkData.network.name, // 중첩된 network 객체에서 name 참조
                admin_state_up: networkData.network.admin_state_up !== false,
                shared: networkData.network.shared === true,
                port_security_enabled: networkData.network.port_security_enabled !== false
            }
        };
        
        // console.log('Final request data:', JSON.stringify(requestData, null, 2));
        const response = await svc.apiRequest(`${networkUrl}/v2.0/networks`, 'post', token, requestData);
        // console.log('Network created:', response);
        
        return response.network;
    } catch (error) {
        console.error('Failed to create network:', error);
        throw error;
    }
};

const deleteNetwork = async (token, config, networkId) => {
    try {
        const networkUrl = await svc.getNetworkEndpoint(token.catalog, config.region);
        console.log(`Deleting network: ${networkId}`);
        
        // 네트워크 삭제 API 호출
        await svc.apiRequest(`${networkUrl}/v2.0/networks/${networkId}`, 'delete', token);
        console.log(`Network ${networkId} deleted successfully`);
        
        // 삭제 성공 시 간단한 응답 반환
        return {
            success: true,
            message: `Network ${networkId} has been deleted`
        };
    } catch (error) {
        console.error(`Failed to delete network ${networkId}:`, error);
        throw error;
    }
};


module.exports = { 
    listNetworks,
    createNetwork,
    deleteNetwork,
    getSubnet
};