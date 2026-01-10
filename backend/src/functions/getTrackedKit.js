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

app.http('getTrackedKit', {
    methods: ['GET'],
    authLevel: 'user',
    handler: async (request, context) => {
        context.log(`getTrackedKit called at "${request.url}"`);

        const searchTerm = request.query.get('f') || '';
        const authHeader = request.headers.get('Authorization')
        const specificID = request.headers.get('ID') || null;
        const assetID = request.headers.get('AssetID') || null;

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
            
                console.log(specificID)
            if(specificID) {
                result = await pool.request()
                    .input('searchTerm', sql.NVarChar, `${specificID}`)
                    .query(`SELECT KT.ID, AssetID, Assets.Name AS AssetName, STRING_AGG(Members.Name, ', ') AS Members, FirstUsed, LastUsed, LengthKept, History, DateReturned
                        FROM [assets].[KitTracking] KT
                        INNER JOIN [assets].[Assets] Assets ON KT.AssetID = Assets.ID
                        INNER JOIN [assets].[KitTrackingPeople] KTP ON KT.ID = KTP.KTID
                        INNER JOIN [membership].[Members] Members ON KTP.MemberID = Members.ID WHERE KT.ID = @searchTerm
                        GROUP BY KT.ID, AssetID, Assets.Name,  FirstUsed, LastUsed, LengthKept, History, DateReturned`);
            }
            else if(assetID) {
                result = await pool.request()
                    .input('searchTerm', sql.NVarChar, `${assetID}`)
                    .query(`SELECT ID FROM [assets].[KitTracking] WHERE History = 0 AND AssetID = @searchTerm`);
            }
            else{
                result = await pool.request()
                    .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
                    .query(`SELECT KT.ID, AssetID, Assets.Name AS AssetName, STRING_AGG(Members.Name, ', ') AS Members, FirstUsed, LastUsed, LengthKept
                        FROM [assets].[KitTracking] KT
                        INNER JOIN [assets].[Assets] Assets ON KT.AssetID = Assets.ID
                        INNER JOIN [assets].[KitTrackingPeople] KTP ON KT.ID = KTP.KTID
                        INNER JOIN [membership].[Members] Members ON KTP.MemberID = Members.ID
                        WHERE KT.History = 0
                        GROUP BY KT.ID, AssetID, Assets.Name,  FirstUsed, LastUsed, LengthKept`);// WHERE Name LIKE @searchTerm`);
            }
            const kitList = result.recordset;
            //console.log(loans)
            return {
                status: 200,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(kitList)
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
