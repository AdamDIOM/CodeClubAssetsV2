import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import AssetTable from '../components/AssetTable';


export default function Loans() {
    const { instance, accounts } = useMsal();
    const [assets, setAssets] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssets = async() => {
            const request = {
                scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
                account: accounts[0]
            };

            try {
                const tokenResponse = await instance.acquireTokenSilent(request);
                const accessToken = tokenResponse.accessToken;

                console.log("token: " + accessToken);

                const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getLoans`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                if(!res.ok) {
                    console.log("error!");
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setAssets(data);
            } catch (err) {
                console.error("Error fetching assets: ", err);
                setError(err.message || "Failed to fetch assets.");
            };
        };
        fetchAssets();
    }, [accounts, instance]);
    return (
        <>
        <p>list</p>
            <AssetTable assets={assets}/>            
        </>
    )
}