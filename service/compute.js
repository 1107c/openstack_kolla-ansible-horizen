const svc = require('./service');
const axios = require('axios');
// 각 리소스 관련 API 함수들
async function listImages(token, config) {
    const imageUrl = await svc.getImageEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${imageUrl}/v2/images`, 'get', token);
    // console.log("data: ",data.images);

    return data.images;
}

async function getImage(token, config, imageId) {
    const imageUrl = await svc.getImageEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${imageUrl}/v2/images/${imageId}`, 'get', token);

    // console.log("data:", data);
    return data;
}

async function createImage(token, config, imageData) {
    // console.log('createImage called with body:', imageData);
    try {
        const imageUrl = await svc.getImageEndpoint(token.catalog, config.region);
        // console.log('Creating Image with data:', imageData);
        
        // 최소한의 필수 필드만 포함한 요청 데이터
        const requestData = {
            container_format: imageData.container_format ,
            disk_format: imageData.disk_format ,
            name: imageData.name,
            visibility: imageData.visibility || 'private'
        };
        
        // 이미지 생성 API 호출
        const response = await svc.apiRequest(`${imageUrl}/v2/images`, 'post', token, requestData);
        // console.log('Image created:', response);
        
        return response;
    } catch (error) {
        console.error('Failed to create image:', error);
        throw error;
    }
}

const uploadImageFile = async (token, config, imageId, fileData) => {
    try {
        const imageUrl = await svc.getImageEndpoint(token.catalog, config.region);
        console.log(`Uploading file data to image: ${imageId}, Data size: ${fileData ? fileData.length : 0} bytes`);
        
        // 파일 데이터 검증
        if (!fileData || fileData.length === 0) {
            throw new Error('No file data provided');
        }
        
        // 바이너리 데이터 직접 전송
        await axios({
            method: 'put',
            url: `${imageUrl}/v2/images/${imageId}/file`,
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Auth-Token': token.token
            },
            data: fileData,
            transformRequest: [(data) => data], // 변환 없이 그대로 전송
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        console.log('Image file uploaded successfully');
        
        // 업로드 후 이미지 정보 조회
        const imageDetails = await svc.apiRequest(`${imageUrl}/v2/images/${imageId}`, 'get', token);
        return imageDetails;
    } catch (error) {
        console.error(`Failed to upload image file for ${imageId}:`, error);
        throw error;
    }
};

const deleteImage = async (token, config, imageId) => {
    try {
        const imageUrl = await svc.getImageEndpoint(token.catalog, config.region);
        console.log(`Deleting image: ${imageId}`);
        
        // 이미지 삭제 API 호출
        await svc.apiRequest(`${imageUrl}/v2/images/${imageId}`, 'delete', token);
        console.log(`Image ${imageId} deleted successfully`);
        
        // 삭제 성공 시 간단한 응답 반환
        return {
            success: true,
            message: `Image ${imageId} has been deleted`
        };
    } catch (error) {
        console.error(`Failed to delete image ${imageId}:`, error);
        throw error;
    }
};

async function listFlavors(token, config) {
    const computeUrl = await svc.getComputeEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${computeUrl}/flavors/detail`, 'get', token);
    return data.flavors;
}

async function listVMs(token, config) {
    const computeUrl = await svc.getComputeEndpoint(token.catalog, config.region);
    const data = await svc.apiRequest(`${computeUrl}/servers/detail`, 'get', token);
    // console.log("data: ",data);
    // console.dir(data.servers[0].addresses.mynetwork[0], { depth: null });

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
        // 중요: action이 문자열인지 확인하고 JSON 객체를 올바르게 구성
        let requestBody = {};
        
        // action이 문자열인지 확인
        if (typeof action === 'string') {
            // 문자열이면 객체의 키로 사용
            requestBody[action] = null;
        } else if (typeof action === 'object') {
            // 이미 객체라면 그대로 사용
            requestBody = action;
        } else {
            throw new Error(`Invalid action type: ${typeof action}`);
        }
        
        // console.log(`요청 본문:`, requestBody);
        // console.log(`요청 JSON:`, JSON.stringify(requestBody));
        
        return svc.apiRequest(`${computeUrl}/servers/${vmId}/action`, 'post', token, requestBody);
    } catch (error) {
        console.error(`VM action error (${action}):`, error.message);
        throw error;
    }
}
async function deleteVM(token, config, vmId) {
    const computeUrl = await svc.getComputeEndpoint(token.catalog, config.region);
    try {
        await svc.apiRequest(`${computeUrl}/servers/${vmId}`, 'delete', token);
        return { success: true, message: `VM ${vmId} deleted successfully` };
    } catch (error) {
        console.error(`VM deletion error for ${vmId}:`, error.message);
        throw new Error(`Failed to delete VM ${vmId}: ${error.message}`);
    }
}

module.exports = { 
    listVMs, 
    createVM,
    vmAction,
    deleteVM, 
    listImages,
    getImage,
    createImage,
    uploadImageFile,
    deleteImage,
    listFlavors, 
};