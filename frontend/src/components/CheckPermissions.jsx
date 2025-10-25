export const checkPermissions = async (accessToken) => {
    const permRes = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/checkPermissions`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if(!permRes.ok){
        console.log(permRes.status)
        const errorBody = await permRes.json();
        throw {status: permRes.status, body: errorBody}
    }

    const permissions = await permRes.json()

    return permissions
}