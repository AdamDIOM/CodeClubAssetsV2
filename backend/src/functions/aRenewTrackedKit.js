const { app } = require('@azure/functions');
const { OnBehalfOfCredential } = require('@azure/identity');
const sql = require('mssql');
const jwt = require('jsonwebtoken');

function identifyChanges(data, originalData) {
    changes = []
    console.log(new Date(originalData.LastUsed ))
    console.log(originalData.LastUsed)
    console.log(new Date())

    if(new Date().toDateString() != new Date(originalData.LastUsed).toDateString()) changes.push({"LastUsed" : originalData.LastUsed})

    return {"From" : changes};
}

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


app.http('aRenewTrackedKit', {
    methods: ['PUT'],
    authLevel: 'user',
    handler: async (request, context) => {
        context.log(`aRenewTrackedKit called at "${request.url}"`);

        const authHeader = request.headers.get('Authorization')
        if(!authHeader.startsWith('Bearer ')) {
            return {status:401, body: "Missing or invalid Authorization header"}
        }
        
        const userAccessToken = authHeader.split(' ')[1]
        const bothData = await request.json()
        const assetData = bothData[0];
        const originalData = bothData[1];
        const changedRaw = identifyChanges(assetData, originalData)
        if(changedRaw.From.length == 0) {
            return { 
                status: 200,
                body: JSON.stringify(`No data changed.`)
            };
        }
        const changes = JSON.stringify(changedRaw);

        const decoded = jwt.decode(userAccessToken);
        const user = (decoded?.name || decoded?.preferred_username)

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
                .input('ID', sql.Int, assetData.ID)
                .input('LastUsed', sql.DateTime, new Date())
                .query(`
                    UPDATE assets.KitTracking
                    SET
                    LastUsed = @LastUsed
                    WHERE ID = @ID;
                `);

                const result2 = await pool.request()
                .input('ID', sql.NVarChar, `${assetData.ID}`)
                .input('User', sql.NVarChar, user)
                .input('Notes', sql.NVarChar, changes)
                .query(`
                    INSERT INTO assets.Logs (AssetID, UserID, Operation, Note, DataTable)
                    VALUES (@ID, @User, 'UPDATE', @Notes, 'KitTracking');
                    `);
            return { 
                status: 200,
                body: JSON.stringify(`Tracked Kit Instance ${assetData.ID} renewed successfully.`)
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
                body: JSON.stringify("Failed to update asset.")
            }
        }
    }
});
