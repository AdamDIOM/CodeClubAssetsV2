import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated } from '@azure/msal-react'

export default function AuthButtons() {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
   

    const login = () => instance.loginRedirect();
    const logout = () => instance.logoutRedirect();

    return (
        <>
            <AuthenticatedTemplate>
                <p>Hello, {account?.name}</p>
                <button onClick={logout}>Sign out</button>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <button onClick={login}>Sign in with Microsoft</button>
            </UnauthenticatedTemplate>
        </>
    )
}