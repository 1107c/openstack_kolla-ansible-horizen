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
const apiRequest = async (url, method, token, data, options = {}) => {
    const requestOptions = {
        method,
        headers: {
            'X-Auth-Token': token.token,
            ...options.headers
        },
        ...options
    };
    
    // 데이터가 있고 transformRequest 옵션이 없으면 기본적으로 JSON 변환
    if (data !== undefined && !options.transformRequest) {
        requestOptions.headers['Content-Type'] = requestOptions.headers['Content-Type'] || 'application/json';
        requestOptions.data = JSON.stringify(data);
    } else if (data !== undefined) {
        requestOptions.data = data;
    }
    
    const response = await axios(url, requestOptions);
    return response.data;
};

module.exports = { getComputeEndpoint, 
                    getImageEndpoint,
                    getNetworkEndpoint,
                    apiRequest
                };
