const express = require('express');
const router = express.Router();
const networkApi = require('../service/network');
const auth = require('../apiHandler');


module.exports = (config) => {
    // 공통 API 핸들러 정의
    const getHandler = (apiFunc) => auth.handleApiRequest(async (token, config, id, body) => {
        return await apiFunc(token, config, id, body);
    }, config);

    // 네트워크 목록 조회
    router.get('/networks', getHandler(networkApi.listNetworks));
    router.get('/subnets/:id', getHandler(networkApi.getSubnet)); 

    return router;
};