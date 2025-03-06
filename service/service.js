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

module.exports = { getComputeEndpoint, 
                    getImageEndpoint,
                    getNetworkEndpoint,
                    apiRequest
                };
