const express = require('express');
const router = express.Router();
const vmApi = require('../api/vmApi');
const auth = require('../auth');

module.exports = (config) => {

    // 공통 API 핸들러 함수
    const handleApiRequest = (apiFunction) => async (req, res) => {
        try {
            const token = await auth.getToken(config);
            const data = await apiFunction(token, config, req.params.id, req.body);
            res.json(data);
        } catch (error) {
            console.error('API error:', error.response && error.response.data || error.message);
            const errorMessage = error.response && error.response.data && error.response.data.badRequest && 
                                error.response.data.badRequest.message || error.message;
            res.status(error.response && error.response.status || 500).json({
                success: false,
                error: errorMessage
            });
        }
    };
    // 이미지 목록 조회
    router.get('/images', handleApiRequest(async (token, config) => {
        return await vmApi.listImages(token, config);
    }));

    // 플레이버 목록 조회
    router.get('/flavors', handleApiRequest(async (token, config) => {
        return await vmApi.listFlavors(token, config);
    }));

    // 네트워크 목록 조회
    router.get('/networks', handleApiRequest(async (token, config) => {
        return await vmApi.listNetworks(token, config);
    }));

    // VM 목록 조회
    router.get('/vms', handleApiRequest(async (token, config) => {
        return await vmApi.listVMs(token, config);
    }));

    // VM 생성
    router.post('/vms', handleApiRequest(async (token, config, id, body) => {
        const vm = await vmApi.createVM(token, config, body);
        return { success: true, vm };
    }));

    // VM 액션 (시작, 중지 등)
    router.post('/vms/:id/action', handleApiRequest(async (token, config, id, body) => {
        return await vmApi.vmAction(token, config, id, body.action);
    }));

    return router;
};