import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated } from '@azure/msal-react'

export default function AuthButtons() {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
   

    const login = () => instance.loginRedirect();
    const logout = () => {
        sessionStorage.setItem('postLoginRedirect', '/');
        instance.logoutRedirect();
    }

    return (
        <>
            <AuthenticatedTemplate>
                <p>Hello, {account?.name}</p>
                <button onClick={logout} className='hover:underline'>Sign out</button>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <button onClick={login} className='hover:underline'>Sign in with Microsoft</button>
            </UnauthenticatedTemplate>
        </>
    )
}