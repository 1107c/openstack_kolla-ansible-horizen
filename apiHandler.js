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

const handleApiRequest = (apiFunction, config) => async (req, res) => {
    try {
        const token = await getToken(config);
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

module.exports = { handleApiRequest, getToken };