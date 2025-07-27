const { app } = require('@azure/functions');
const sql = require('mssql');
const dbConfig = require('../../dbConfig');

app.http('getAssets', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`getAssets called at "${request.url}"`);

        const searchTerm = request.query.get('f') || '';
        console.log(searchTerm)

        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
                .query('SELECT * FROM dbo.Assets WHERE Name LIKE @searchTerm');
            const assets = result.recordset;
        
            return { 
                status: 200,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(assets)
            };
        } catch (err) {
            context.log.error('Database error: ', err);
            return {
                status: 500,
                body: "Failed to retrieve assets from database."
            }
        }
    }
});
