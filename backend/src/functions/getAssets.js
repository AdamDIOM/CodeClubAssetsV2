const { app } = require('@azure/functions');

app.http('getAssets', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`getAssets called at "${request.url}"`);

        const assets = [
            { id: 1, name:"Raspberry Pi 4", location:"ABCD"},
            { id: 2, name:"BBC micro:bit", location:"CDEF"}
        ];

        return { 
            status: 200,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(assets)
        };
    }
});
