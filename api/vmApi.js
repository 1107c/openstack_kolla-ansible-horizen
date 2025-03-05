const axios = require('axios');

// 서비스 엔드포인트 조회를 위한 공통 함수
async function getServiceEndpoint(catalog, serviceType, region, interfaceType = 'internal') {
    const service = catalog.find(service => service.type === serviceType);
    if (!service) {
        throw new Error(`Service ${serviceType} not found in catalog`);
    }
    
    const endpoint = service.endpoints.find(
        endpoint => endpoint.region === region && endpoint.interface === interfaceType
    );
    
    if (!endpoint) {
        throw new Error(`No ${serviceType} endpoint found for region ${region} with ${interfaceType} interface`);
    }
    
    return endpoint.url;
}

// 각 서비스별 엔드포인트 조회 함수들
async function getComputeEndpoint(catalog, region) {
    return getServiceEndpoint(catalog, 'compute', region);
}

async function getImageEndpoint(catalog, region) {
    return getServiceEndpoint(catalog, 'image', region);
}

async function getNetworkEndpoint(catalog, region) {
    return getServiceEndpoint(catalog, 'network', region);
}

// API 요청을 위한 공통 함수
async function apiRequest(url, method, token, data = null) {
    const config = {
        method,
        url,
        headers: { 'X-Auth-Token': token.id || token.token }
    };
    
    if (data) {
        config.data = data;
    }
    
    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`API request error: ${url}`, 
            error.response && error.response.data || error.message);
        throw error;
    }
}

// 각 리소스 관련 API 함수들
async function listImages(token, config) {
    const imageUrl = await getImageEndpoint(token.catalog, config.region);
    const data = await apiRequest(`${imageUrl}/v2/images`, 'get', token);
    return data.images;
}

async function listFlavors(token, config) {
    const computeUrl = await getComputeEndpoint(token.catalog, config.region);
    const data = await apiRequest(`${computeUrl}/flavors/detail`, 'get', token);
    return data.flavors;
}

async function listNetworks(token, config) {
    const networkUrl = await getNetworkEndpoint(token.catalog, config.region);
    const data = await apiRequest(`${networkUrl}/v2.0/networks`, 'get', token);
    return data.networks;
}

async function listVMs(token, config) {
    const computeUrl = await getComputeEndpoint(token.catalog, config.region);
    const data = await apiRequest(`${computeUrl}/servers/detail`, 'get', token);
    console.log("data: ",data);
    console.dir(data.servers[0].flavor, { depth: null });

    return data.servers;
}

async function createVM(token, config, vmData) {
    const computeUrl = await getComputeEndpoint(token.catalog, config.region);
    console.log('Creating VM with data:', vmData);
    
    const serverData = {
        server: {
            name: vmData.name,
            imageRef: vmData.imageId,
            flavorRef: vmData.flavorId,
            networks: [{ uuid: vmData.networkId }]
        }
    };
    
    const data = await apiRequest(`${computeUrl}/servers`, 'post', token, serverData);
    console.log('VM created:', data.server);
    return data.server;
}

async function vmAction(token, config, vmId, action) {
    const computeUrl = await getComputeEndpoint(token.catalog, config.region);
    try {
        // VM 상태 확인 먼저 수행
        const vmData = await apiRequest(`${computeUrl}/servers/${vmId}`, 'get', token);
        const vmStatus = vmData.server.status;
        console.log(`Current VM status: ${vmStatus}`);
        
        // 시작 액션은 SHUTOFF 상태에서만 가능
        if (action === 'os-start' && vmStatus !== 'SHUTOFF') {
            throw new Error(`Cannot start VM in ${vmStatus} state. VM must be in SHUTOFF state.`);
        }
        
        // 중지 액션은 ACTIVE 상태에서만 가능
        if (action === 'os-stop' && vmStatus !== 'ACTIVE') {
            throw new Error(`Cannot stop VM in ${vmStatus} state. VM must be in ACTIVE state.`);
        }
        
        // 액션 수행
        return apiRequest(`${computeUrl}/servers/${vmId}/action`, 'post', token, { [action]: null });
    } catch (error) {
        console.error(`VM action error (${action}):`, error.message);
        throw error;
    }
}
module.exports = { 
    listVMs, 
    createVM, 
    vmAction, 
    listImages, 
    listFlavors, 
    listNetworks 
};