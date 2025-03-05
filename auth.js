const axios = require('axios');

async function getToken(config) {
    const authData = {
        auth: {
            identity: {
                methods: ['password'],
                password: {
                    user: {
                        name: config.username,
                        domain: { name: config.userDomain },
                        password: config.password
                    }
                }
            },
            scope: {
                project: {
                    name: config.projectName,
                    domain: { name: config.projectDomain }
                }
            }
        }
    };

    const response = await axios.post(
        `${config.authUrl}/v3/auth/tokens`,
        authData,
        
        { headers: { 'Content-Type': 'application/json' } }
    );
    return {
        token: response.headers['x-subject-token'],
        catalog: response.data.token.catalog
    };
}

module.exports = { getToken };