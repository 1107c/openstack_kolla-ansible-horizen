const express = require('express');
const app = express();
const computeApi = require('./api/computeApi');
const networkApi = require('./api/networkApi');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


app.use(express.raw({ 
    type: 'application/octet-stream', 
    limit: '10gb' // 대용량 파일 허용
}));

// URL 인코딩된 요청 처리
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());


// 환경 변수 설정
const config = {
    authUrl: process.env.OS_AUTH_URL,
    username: process.env.OS_USERNAME,
    password: process.env.OS_PASSWORD,
    projectName: process.env.OS_PROJECT_NAME,
    userDomain: process.env.OS_USER_DOMAIN_NAME,
    projectDomain: process.env.OS_PROJECT_DOMAIN_NAME,
    region: process.env.OS_REGION_NAME,
    interface: process.env.OS_INTERFACE,
    identityVersion: process.env.OS_IDENTITY_API_VERSION
};

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'OpenStack API Server',
            version: '1.0.0',
            description: 'OpenStack Compute와 Network API를 제공하는 서버'
        },
        servers: [
            { url: 'http://localhost:3001', description: '로컬 개발 서버' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'Token',
                    description: 'OpenStack 인증 토큰 (X-Auth-Token)을 입력하세요.'
                }
            }
        },
        security: [{ bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'Token',
            description: 'OpenStack 인증 토큰(X-Auth-Token)을 입력해야 합니다. 입력하지 않으면 "Try it out" 실행 시 401 오류가 발생합니다.'
        }}] // 모든 엔드포인트에 기본 적용
    },
    apis: ['./api/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 라우트 등록
app.use('/v1/compute', computeApi(config));
app.use('/v1/network', networkApi(config));

app.listen(3001, () => {
    console.log('Server running on port 3001');
});