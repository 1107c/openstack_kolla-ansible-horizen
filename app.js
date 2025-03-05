const express = require('express');
const app = express();
const vmRoutes = require('./routes/vmRoutes');

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

// 라우트 등록
app.use('/v1/compute', vmRoutes(config));

app.listen(3001, () => {
    console.log('Server running on port 3001');
});