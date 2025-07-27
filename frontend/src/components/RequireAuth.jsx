import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { useEffect } from "react";
import { Navigate } from "react-router-dom"

export default function RequireAuth({ children, msalReady }) {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
    const isAuthenticated = !!account;


    useEffect(() => {
        if(!isAuthenticated) {
            if(!sessionStorage.getItem('postLoginRedirect')) {
                sessionStorage.setItem('postLoginRedirect', window.location.pathname);
            }
            instance.loginRedirect();
        }
    }, [isAuthenticated])

    return isAuthenticated ? children : <p>Redirecting to sign in...</p>
}