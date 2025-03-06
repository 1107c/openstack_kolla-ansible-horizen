const svc = require('./service');

// 각 리소스 관련 API 함수들
async function listImages(token, config) {
    const imageUrl = await svc.getImageEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${imageUrl}/v2/images`, 'get', token);
    // console.log("data: ",data.images);

    return data.images;
}

async function listFlavors(token, config) {
    const computeUrl = await svc.getComputeEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${computeUrl}/flavors/detail`, 'get', token);
    return data.flavors;
}

async function listVMs(token, config) {
    const computeUrl = await svc.getComputeEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${computeUrl}/servers/detail`, 'get', token);
    // console.log("data: ",data);
    // console.dir(data.servers[0].image, { depth: null });

    // const image = await svc.apiRequest(data.servers[0].image.links[0].href, token);
    // console.log("image: ", image);

    return data.servers;
}

async function createVM(token, config, vmData) {
    const computeUrl = await svc.getComputeEndpoint(token.catalog, config.region);
    console.log('Creating VM with data:', vmData);
    
    const serverData = {
        server: {
            name: vmData.name,
            imageRef: vmData.imageId,
            flavorRef: vmData.flavorId,
            networks: [{ uuid: vmData.networkId }]
        }
    };
    
    const data = await svc.apiRequest(`${computeUrl}/servers`, 'post', token, serverData);
    console.log('VM created:', data.server);
    return data.server;
}

async function vmAction(token, config, vmId, action) {
    const computeUrl = await svc.getComputeEndpoint(token.catalog, config.region);
    try {
        // VM 상태 확인 먼저 수행
        // const vmData = await svc.apiRequest(`${computeUrl}/servers/${vmId}`, 'get', token);
        // const vmStatus = vmData.server.status;
        // console.log(`Current VM status: ${vmStatus}`);
        
        // 액션 수행
        if (action === 'delete')
            return svc.apiRequest(`${computeUrl}/servers/${vmId}`, 'delete', token);
        return svc.apiRequest(`${computeUrl}/servers/${vmId}/action`, 'post', token, { [action]: null });
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
};