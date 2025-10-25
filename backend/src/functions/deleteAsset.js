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


app.http('deleteAsset', {
    route: 'deleteAsset/{id}',
    methods: ['DELETE'],
    authLevel: 'user',
    handler: async (request, context) => {
        const id = request.params.id;
        context.log(`deleteAsset called at "${request.url}"`);

        const authHeader = request.headers.get('Authorization')
        if(!authHeader.startsWith('Bearer ')) {
            return {status:401, body: "Missing or invalid Authorization header"}
        }
        
        const userAccessToken = authHeader.split(' ')[1]

        const decoded = jwt.decode(userAccessToken);
        const user = (decoded?.name || decoded?.preferred_username)


        if(!id) {
            return {status: 400, body: JSON.stringify("Missing asset id")}
        }

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
                .input('ID', sql.NVarChar, id)
                .query(`
                    UPDATE dbo.Assets
                    SET
                    Deleted = 1
                    WHERE ID = @ID;
                `);

                const result2 = await pool.request()
                .input('ID', sql.NVarChar, id)
                .input('User', sql.NVarChar, user)
                .query(`
                    INSERT INTO dbo.Logs (AssetID, UserID, Operation)
                    VALUES (@ID, @User, 'DELETE');
                    `);
            return { 
                status: 200,
                body: JSON.stringify(`Asset ${id} deleted successfully.`)
            };
        } catch (err) {
            context.error('Database error: ', err);
            context.error('Error number: ', err.number)
            if(err.code === "ELOGIN" || err.originalError && err.originalError === "ELOGIN") {
                return {
                    status: 401,
                    body: JSON.stringify("Login failed. Do you have permission to be using this system?")
                }
            }
            if (err.code === "EREQUEST" || err.originalError && err.originalError === "EREQUEST" || err.number === 229 || err.originalError && err.originalError.number === 229) {
                return {
                    status: 403,
                    body: JSON.stringify("You do not have permission to perform this action")
                };
            }
            if (err.number === 2628 || err.originalError && err.originalError.number === 2628){
                return {
                status: 400,
                body: JSON.stringify(err.message)
                }
            }
            if (err.number === 8114 || err.originalError && err.originalError.number === 8114){
                return {
                status: 400,
                body: JSON.stringify("Input type mismatch.")
                }
            }
            if (err.number === 18456 || err.originalError && err.originalError.number === 18456){
                return {
                status: 401,
                body: JSON.stringify("You do not have permission to write to the database.")
                }
            }
            return {
                status: 500,
                body: JSON.stringify("Failed to delete asset.")
            }
        }
    }
});
