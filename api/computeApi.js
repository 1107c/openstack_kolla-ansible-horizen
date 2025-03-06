const express = require('express');
const router = express.Router();
const computeApi = require('../service/compute');
const auth = require('../apiHandler');


module.exports = (config) => {
    // 공통 API 핸들러 정의
    const getHandler = (apiFunc) => auth.handleApiRequest(async (token, config) => {
        return await apiFunc(token, config);
    }, config);

    // 이미지 목록 조회
    router.get('/images', getHandler(computeApi.listImages));

    // 플레이버 목록 조회
    router.get('/flavors', getHandler(computeApi.listFlavors));

    // vm 목록 조회
    router.get('/vms', getHandler(computeApi.listVMs));

    // vm 생성
    router.post('/vms', auth.handleApiRequest(async (token, config, id, body) => {
        const compute = await computeApi.createVM(token, config, body);
        return { success: true, compute };
    }, config));

    // compute 액션
    router.post('/vms/:id/action', auth.handleApiRequest(async (token, config, id, body) => {
        return await computeApi.vmAction(token, config, id, body.action);
    }, config));

    return router;
};