const express = require('express');
const router = express.Router();
const computeApi = require('../service/compute');
const auth = require('../apiHandler');
const multer = require('multer'); // 파일 업로드 처리를 위한 미들웨어


// 파일 업로드 처리를 위한 multer 설정
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB 제한
});

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
     * /v1/compute/images:
     *   get:
     *     summary: 이미지 목록을 조회합니다.
     *     tags: [Images]
     *     responses:
     *       200:
     *         description: 이미지 목록 반환
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: 이미지 ID
     *                   name:
     *                     type: string
     *                     description: 이미지 이름
     *                   status:
     *                     type: string
     *                     description: 이미지 상태
     *                   size:
     *                     type: integer
     *                     description: 이미지 크기(바이트)
     *       401:
     *         description: 인증 실패
     */
    router.get('/images', Handler(computeApi.listImages));

    /**
     * @openapi
     * /v1/compute/images/{id}:
     *   get:
     *     summary: 지정된 이미지를 조회합니다.
     *     tags: [Images]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: 조회할 이미지 ID
     *     responses:
     *       200:
     *         description: 이미지 상세 정보 반환
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 name:
     *                   type: string
     *                 status:
     *                   type: string
     *                 disk_format:
     *                   type: string
     *       404:
     *         description: 이미지를 찾을 수 없음
     *       401:
     *         description: 인증 실패
     */
    router.get('/images/:id', Handler(computeApi.getImage, true));

    /**
     * @openapi
     * /v1/compute/images/{id}:
     *   delete:
     *     summary: 지정된 이미지를 삭제합니다.
     *     tags: [Images]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: 삭제할 이미지 ID
     *     responses:
     *       204:
     *         description: 이미지 삭제 성공
     *       401:
     *         description: 인증 실패
     *       404:
     *         description: 이미지를 찾을 수 없음
     */
    router.delete('/images/:id', Handler(computeApi.deleteImage, true));

    /**
     * @openapi
     * /v1/compute/images:
     *   post:
     *     summary: 새로운 이미지 메타데이터를 생성합니다.
     *     tags: [Images]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               image:
     *                 type: object
     *                 required:
     *                   - name
     *                   - disk_format
     *                   - container_format
     *                 properties:
     *                   name:
     *                     type: string
     *                     description: 이미지 이름
     *                   disk_format:
     *                     type: string
     *                     enum: [ami, ari, aki, vhd, vhdx, vmdk, raw, qcow2, vdi, iso]
     *                   container_format:
     *                     type: string
     *                     enum: [ami, ari, aki, bare, ovf]
     *                   min_disk:
     *                     type: integer
     *                     description: 최소 디스크 요구량(GB)
     *     responses:
     *       201:
     *         description: 이미지 메타데이터 생성 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 image:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     status:
     *                       type: string
     *       400:
     *         description: 잘못된 요청
     *       401:
     *         description: 인증 실패
     */
    router.post('/images', Handler(computeApi.createImage, false, true));

    /**
     * @openapi
     * /v1/compute/images/{id}/file:
     *   put:
     *     summary: 이미지 파일을 업로드합니다.
     *     tags: [Images]
     *     consumes:
     *       - multipart/form-data
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: 이미지 ID
     *       - in: formData
     *         name: file
     *         type: file
     *         required: true
     *         description: 업로드할 이미지 파일
     *     responses:
     *       200:
     *         description: 파일 업로드 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                 upload_progress:
     *                   type: integer
     *       400:
     *         description: 파일 없음 또는 잘못된 요청
     *       401:
     *         description: 인증 실패
     *       404:
     *         description: 이미지를 찾을 수 없음
     */
    router.put('/images/:id/file', upload.single('file'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }
            
            const token = await auth.getToken(config);
            const fileData = req.file.buffer; // 업로드된 파일 버퍼
            
            const data = await computeApi.uploadImageFile(token, config, req.params.id, fileData);
            res.json(data);
        } catch (error) {
            console.error('API error:', error);
            res.status(error.response && error.response.status || 500).json({
                success: false,
                error: error.message
            });
        }
    });
    /**
     * @openapi
     * /v1/compute/flavors:
     *   get:
     *     summary: 플레이버 목록을 조회합니다.
     *     tags: [Flavors]
     *     responses:
     *       200:
     *         description: 플레이버 목록 반환
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: 플레이버 ID
     *                   name:
     *                     type: string
     *                   vcpus:
     *                     type: integer
     *                   ram:
     *                     type: integer
     *                   disk:
     *                     type: integer
     *       401:
     *         description: 인증 실패
     */
    router.get('/flavors', Handler(computeApi.listFlavors));

    /**
     * @openapi
     * /v1/compute/vms:
     *   get:
     *     summary: 가상머신 목록을 조회합니다.
     *     tags: [Virtual Machines]
     *     responses:
     *       200:
     *         description: VM 목록 반환
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   name:
     *                     type: string
     *                   status:
     *                     type: string
     *                   flavor:
     *                     type: string
     *       401:
     *         description: 인증 실패
     */
    router.get('/vms', Handler(computeApi.listVMs));

    /**
     * @openapi
     * /v1/compute/vms:
     *   post:
     *     summary: 새로운 가상머신을 생성합니다.
     *     tags: [Virtual Machines]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               server:
     *                 type: object
     *                 required:
     *                   - name
     *                   - flavorRef
     *                   - imageRef
     *                 properties:
     *                   name:
     *                     type: string
     *                   flavorRef:
     *                     type: string
     *                   imageRef:
     *                     type: string
     *                   networks:
     *                     type: array
     *                     items:
     *                       type: object
     *                       properties:
     *                         uuid:
     *                           type: string
     *     responses:
     *       202:
     *         description: VM 생성 요청 수락
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 server:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     adminPass:
     *                       type: string
     *       400:
     *         description: 잘못된 요청
     *       401:
     *         description: 인증 실패
     */
    router.post('/vms', Handler(computeApi.createVM, false, true));

    /**
     * @openapi
     * /v1/compute/vms/{id}/action:
     *   post:
     *     summary: 가상머신 액션을 수행합니다.
     *     tags: [Virtual Machines]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: VM ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               action:
     *                 type: string
     *                 enum: [start, stop, reboot]
     *               reboot_type:
     *                 type: string
     *                 enum: [SOFT, HARD]
     *     responses:
     *       202:
     *         description: 액션 요청 수락
     *       400:
     *         description: 잘못된 액션 유형
     *       401:
     *         description: 인증 실패
     *       409:
     *         description: 현재 상태에서 허용되지 않는 액션
     */
    router.post('/vms/:id/action', Handler(computeApi.vmAction, true, true));

    /**
     * @openapi
     * /v1/compute/vms/{id}:
     *   delete:
     *     summary: 지정된 가상머신을 삭제합니다.
     *     tags: [Virtual Machines]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: 삭제할 VM ID
     *     responses:
     *       204:
     *         description: VM 삭제 성공
     *       401:
     *         description: 인증 실패
     *       404:
     *         description: VM을 찾을 수 없음
     */


    // 이미지 파일 업로드

    return router;
};