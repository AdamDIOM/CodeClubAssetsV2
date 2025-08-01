import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated } from '@azure/msal-react'
import React from 'react';

export default function AuthButtons({className}) {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
   

    const login = () => instance.loginRedirect();
    const logout = () => {
        sessionStorage.setItem('postLoginRedirect', '/');
        instance.logoutRedirect();
    }

    return (
        <span className={className}>
            <AuthenticatedTemplate>
                <button onClick={logout} className='hover:underline'>Sign out</button>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <button onClick={login} className='hover:underline'>Sign in with Microsoft</button>
            </UnauthenticatedTemplate>
        </span>
    )
}