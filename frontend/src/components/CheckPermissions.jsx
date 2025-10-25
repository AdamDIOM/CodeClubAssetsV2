export const checkPermissions = async (accessToken) => {
    console.log(accessToken)
    const permRes = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/checkPermissions`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`
        }
    });
    console.log(permRes)
    if(!permRes.ok){
        console.log(permRes.status)
        const errorBody = await permRes.json();
        throw {status: permRes.status, body: errorBody}
    }

    const permissions = await permRes.json()

    return permissions
}