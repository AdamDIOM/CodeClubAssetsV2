import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import AssetTable from '../components/AssetTable';


export default function List() {
    const { instance, accounts } = useMsal();
    const [assets, setAssets] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssets = async() => {
            const request = {
                scopes: ['api://3aa70f4c-6909-497b-b2d1-b72b8a7aa70a/access_as_user'],
                account: accounts[0]
            };

            try {
                const tokenResponse = await instance.acquireTokenSilent(request);
                const accessToken = tokenResponse.accessToken;

                console.log("token: " + accessToken);

                const res = await fetch("https://assets-b3d4gjhmf3g4cfda.ukwest-01.azurewebsites.net/api/getAssets", {
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