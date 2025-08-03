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


app.http('createAsset', {
    methods: ['POST'],
    authLevel: 'user',
    handler: async (request, context) => {
        context.log(`createAsset called at "${request.url}"`);

        const authHeader = request.headers.get('Authorization')

        if(!authHeader.startsWith('Bearer ')) {
            return {status:401, body: "Missing or invalid Authorization header"}
        }

        const userAccessToken = authHeader.split(' ')[1]
        const assetData = await request.json()

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
                .input('ID', sql.NVarChar, assetData.ID)
                .input('Name', sql.NVarChar, assetData.Name)
                .input('Description', sql.NVarChar, assetData.Description)
                .input('Location', sql.NVarChar, assetData.Location)
                .input('SerialNumber', sql.NVarChar, assetData.SerialNumber)
                .input('ParentID', sql.NVarChar, assetData.ParentID)
                .input('Tags', sql.NVarChar, assetData.Tags)
                .input('TestsRequired', sql.Bit, assetData.TestsRequired)
                .input('Out', sql.Bit, assetData.Out)
                .query(`
                    INSERT INTO dbo.Assets (ID, Name, Description, Location, SerialNumber, ParentID, Tags, TestsRequired, Out)
                    VALUES (@ID, @Name, @Description, @Location, @SerialNumber, @ParentID, @Tags, @TestsRequired, @Out)
                `);
        
            return { 
                status: 201,
                body: "Asset created successfully."
            };
        } catch (err) {
            context.error('Database error: ', err);
            return {
                status: 500,
                body: "Failed to create asset."
            }
        }
    }
});
