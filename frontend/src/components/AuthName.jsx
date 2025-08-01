import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated } from '@azure/msal-react'

export default function AuthName({prefix}) {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();

    return (
        <>
            <AuthenticatedTemplate>
                <span>{prefix}{account?.name}</span>
            </AuthenticatedTemplate>
        </>
    )
}