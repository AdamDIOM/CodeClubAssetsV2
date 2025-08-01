const { app } = require('@azure/functions');
const { OnBehalfOfCredential } = require('@azure/identity');
const { ConfidentialClientApp } = require('@azure/msal-node');
const sql = require('mssql');
const dbConfig = require('../../dbConfig');

async function getSqlAccessToken(userAccessToken) {
    const credential = new OnBehalfOfCredential({
        tenantId: '5eb26f0a-532d-45f6-b1b4-58c84e52a7c5',
        clientId: '3aa70f4c-6909-497b-b2d1-b72b8a7aa70a',
        clientSecret: process.env.CLIENT_SECRET,
        userAssertionToken: userAccessToken
    });

    const token = await credential.getToken('https://database.windows.net/.default')
    return token.token;
}


app.http('getAssets', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`getAssets called at "${request.url}"`);

        const searchTerm = request.query.get('f') || '';
        context.log(request.query)
        context.log(searchTerm)

        const authHeader = request.headers.get('Authorization')

        if(!authHeader.startsWith('Bearer ')) {
            return {status:401, body: "Missing or invalid Authorization header"}
        }

        const userAccessToken = authHeader.split(' ')[1]

        try {
            const sqlAccessToken = await getSqlAccessToken(userAccessToken);

            const pool = new sql.ConnectionPool({
                server: process.env.DB_SERVER,
                database: process.env.DB_NAME,
                authentication: {
                    type: 'azure-active-directory-access-token',
                    options: {
                        token: sqlAccessToken
                    }
                },
                options: {
                    encrypt: true,
                    connectTimeout: 70000
                }
            });

            await pool.connect();
            const result = await pool.request()
                .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
                .query('SELECT * FROM dbo.Assets WHERE Name LIKE @searchTerm');
            const assets = result.recordset;
            //context.log(result)
        
            return { 
                status: 200,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(assets)
            };
        } catch (err) {
            context.error('Database error: ', err);
            return {
                status: 500,
                body: "Failed to retrieve assets from database."
            }
        }
    }
});
