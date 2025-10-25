export const checkPermissions = async (accessToken) => {
    const permRes = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/checkPermissions`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`
        }
    });
    if(!permRes.ok){
        const errorBody = await permRes.json();
        throw {status: permRes.status, body: errorBody}
    }

    const permissions = await permRes.json()

    return permissions
}