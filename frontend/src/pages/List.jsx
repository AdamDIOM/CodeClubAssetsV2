import { useMsal } from '@azure/msal-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AssetTable from '../components/AssetTable';


export default function List() {
    const { instance, accounts } = useMsal();
    const [ searchParams, setSearchParams] = useSearchParams();

    const initialSearch = searchParams.get('f') || '';
    const [searchInput, setSearchInput] = useState(initialSearch);
    
    const [assets, setAssets] = useState([]);
    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const fetchAssets = async() => {
        if (!accounts.length) return;
        //console.log(accounts.length)
        const request = {
            scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
            account: accounts[0]
        };

        try {
            const tokenResponse = await instance.acquireTokenSilent(request);
            const accessToken = tokenResponse.accessToken;

            // console.log("token: " + accessToken);

            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getAssets`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if(!res.ok) {
                //console.log("error!");
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setAssets(data);
        } catch (err) {
            console.error("Error fetching assets: ", err);
            setError(err.message || "Failed to fetch assets.");
        }finally {

            setLoading(false);
        };
    };

    useEffect(() => {
        if(accounts.length === 0 ) {
            setLoading(true)
            return;
        }
        setLoading(true)
        fetchAssets();
    }, [accounts]);


    const filteredAssets = useMemo(() => {
        const term = searchInput.toLowerCase();
        if(!term) return assets;
        return assets.filter(asset => 
            asset.Name?.toLowerCase().includes(term) || asset.Description?.toLowerCase().includes(term) || asset.ID.toLowerCase().includes(term) || (asset.Tags != null && asset.Tags.toLowerCase().includes(term))
        )
    }, [assets, searchInput])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = searchInput.trim()
        setSearchParams(trimmed? {f: trimmed} : {});
        await fetchAssets();
    }

    const handleUpdate = (e) => {
        setSearchInput(e.target.value)
        const trimmed = e.target.value.trim()
        setSearchParams(trimmed? {f: trimmed} : {});
    }

    useEffect(() => {
        setSearchInput(searchParams.get('f') || '');
    },[])

    return (
        <div className="px-4 py-6 lg:w-[85vw] w-[95vw] max-w-5xl mx-auto">
            {loading ? (
                <>
                <div className="flex justify-center items-center h-64">
                    <p>Loading...</p>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-club-green-600"></div>
                </div>
                </>
            ) : (
                    <>
                        <form onSubmit={handleSubmit} className='w-full mb-4 flex gap-2'>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchInput}
                                onChange={handleUpdate}
                                className='flex-grow px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 w-80'
                            />
                        </form>
                        {error && <p className='text-red-600'>{error}</p>}
                        {filteredAssets.length ? (
                            <AssetTable assets={filteredAssets}/>   
                        ) : (
                            <p>No assets found.</p>
                        )}
                        
                  </>
            )}            
        </div>
    )
}

