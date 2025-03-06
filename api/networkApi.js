const express = require('express');
const router = express.Router();
const networkApi = require('../service/network');
const auth = require('../apiHandler');


module.exports = (config) => {
    // 공통 API 핸들러 정의
    const Handler = (apiFunc, requiresId = false, requiresBody = false) => auth.handleApiRequest(
        async (token, config, id, body) => {
            const params = [token, config];
            if (requiresId) params.push(id);
            if (requiresBody) params.push(body);
            return await apiFunc(...params);
        },
        config
    );

    /**
     * @openapi
     * /v1/network/networks:
     *   get:
     *     summary: 네트워크 목록을 조회합니다.
     *     tags: [Networks]
     *     responses:
     *       200:
     *         description: 네트워크 목록 반환
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: 네트워크 ID
     *                   name:
     *                     type: string
     *                     description: 네트워크 이름
     *                   status:
     *                     type: string
     *                     description: 네트워크 상태
     *       401:
     *         description: 인증 실패
     */
    router.get('/networks', Handler(networkApi.listNetworks));

    /**
     * @openapi
     * /v1/network/subnets/{id}:
     *   get:
     *     summary: 지정된 서브넷을 조회합니다.
     *     tags: [Networks]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: 조회할 서브넷 ID
     *     responses:
     *       200:
     *         description: 서브넷 정보 반환
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                     type: string
     *                 name:
     *                     type: string
     *                 network_id:
     *                     type: string
     *                 cidr:
     *                     type: string
     *       401:
     *         description: 인증 실패
     *       404:
     *         description: 서브넷을 찾을 수 없음
     */
    router.get('/subnets/:id', Handler(networkApi.getSubnet, true));

    /**
     * @openapi
     * /v1/network/networks:
     *   post:
     *     summary: 새로운 네트워크를 생성합니다.
     *     tags: [Networks]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               network:
     *                 type: object
     *                 required:
     *                   - name
     *                 properties:
     *                   name:
     *                     type: string
     *                     description: 네트워크 이름
     *                   admin_state_up:
     *                     type: boolean
     *                     default: true
     *                   shared:
     *                     type: boolean
     *                     default: false
     *                   port_security_enabled:
     *                     type: boolean
     *                     default: true
     *     responses:
     *       201:
     *         description: 네트워크 생성 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 network:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     name:
     *                       type: string
     *       400:
     *         description: 잘못된 요청
     *       401:
     *         description: 인증 실패
     */
    router.post('/networks', Handler(networkApi.createNetwork, false, true));

    /**
     * @openapi
     * /v1/network/networks/{id}:
     *   delete:
     *     summary: 지정된 네트워크를 삭제합니다.
     *     tags: [Networks]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: 삭제할 네트워크 ID
     *     responses:
     *       204:
     *         description: 네트워크 삭제 성공
     *       401:
     *         description: 인증 실패
     *       404:
     *         description: 네트워크를 찾을 수 없음
     */
    router.delete('/networks/:id', Handler(networkApi.deleteNetwork, true));

    return router;
};