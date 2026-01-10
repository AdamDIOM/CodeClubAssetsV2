const { app } = require('@azure/functions');
const { OnBehalfOfCredential } = require('@azure/identity');
const sql = require('mssql');

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

app.http('getMember', {
    methods: ['GET'],
    authLevel: 'user',
    handler: async (request, context) => {
        context.log(`getMember called at "${request.url}"`);

        const searchTerm = request.query.get('f') || '';
        const authHeader = request.headers.get('Authorization')
        const MMID = request.headers.get('MMID') || null;
        const ID = request.headers.get('ID') || null;

        if(!authHeader.startsWith('Bearer ')) {
            return {status:401, body: JSON.stringify("Missing or invalid Authorization header")}
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
            var result;
            
            if(MMID) {
                result = await pool.request()
                    .input('searchTerm', sql.NVarChar, `${MMID}`)
                    .query(`SELECT ID, Name FROM [membership].[Members] WHERE MMID = @searchTerm`);
            }
            else if(ID) {
                result = await pool.request()
                    .input('searchTerm', sql.NVarChar, `${ID}`)
                    .query(`SELECT ID, Name FROM [membership].[Members] WHERE ID = @searchTerm`);
            }
            else{
                throw new Error("No search parameters provided");
            }
            const member = result.recordset;
            //console.log(loans)
            return {
                status: 200,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(member)
            };
        } catch (err) {
            context.error('Database error: ', err);
            if(err.code === "ELOGIN" || err.originalError && err.originalError === "ELOGIN") {
                return {
                    status: 401,
                    body: JSON.stringify("Login failed. Do you have permission to be here?")
                }
            }
            if(err.code === "EREQUEST" || err.originalError && err.originalError === "EREQUEST") {
                return {
                    status: 403,
                    body: JSON.stringify("You do not have permission to read from the database")
                }
            }
            return {
                status: 500,
                body: "Failed to retrieve kit list from database."
            }
        }
    }
});
