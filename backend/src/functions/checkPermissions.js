const { app } = require('@azure/functions');
const { OnBehalfOfCredential } = require('@azure/identity');
const sql = require('mssql');
const jwt = require('jsonwebtoken');

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


app.http('checkPermissions', {
    methods: ['GET'],
    authLevel: 'user',
    handler: async (request, context) => {
        context.log(`checkPermissions called at "${request.url}"`);

        const authHeader = request.headers.get('Authorization')
        if(!authHeader.startsWith('Bearer ')) {
            return {status:401, body: "Missing or invalid Authorization header"}
        }
        
        const userAccessToken = authHeader.split(' ')[1]

        const decoded = jwt.decode(userAccessToken);
        const user = (decoded?.preferred_username)

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
            console.log(decoded.preferred_username)
            const result = await pool.request()
                .input('Email', sql.NVarChar, decoded.preferred_username)
                .query(`
                    SELECT dp1.name AS DatabaseRoleName
                    FROM sys.database_role_members AS drm
                    JOIN sys.database_principals AS dp1 ON drm.role_principal_id = dp1.principal_id
                    JOIN sys.database_principals AS dp2 ON drm.member_principal_id = dp2.principal_id
                    WHERE dp2.name = @Email;
                `);
            const roles = result.recordset.map(r => r.DatabaseRoleName);
            //console.log(roles)
            return { 
                status: 201,
                body: JSON.stringify(roles)
            };
        } catch (err) {
            context.error('Database error: ', err);
            context.error('Error number: ', err.number)
            if(err.code === "ELOGIN" || err.originalError && err.originalError === "ELOGIN") {
                return {
                    status: 401,
                    body: JSON.stringify("Login failed. Do you have permission to be here?")
                }
            }
            return {
                status: 500,
                body: JSON.stringify("Failed to check permissions.")
            }
        }
    }
});
