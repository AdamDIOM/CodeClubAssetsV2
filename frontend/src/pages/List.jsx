import { useMsal } from '@azure/msal-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AssetTable from '../components/AssetTable';
import { checkPermissions } from '../components/CheckPermissions';


export default function List() {
    const { instance, accounts } = useMsal();
    const [ searchParams, setSearchParams] = useSearchParams();

    const initialSearch = searchParams.get('f') || '';
    const [searchInput, setSearchInput] = useState(initialSearch);
    
    const [assets, setAssets] = useState([]);
    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const [editPerms, setEditPerms] = useState(false)

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

            const x = await checkPermissions(accessToken);
            console.log("x ", x)
            if(x.includes('db_datawriter')) setEditPerms(true)
            
            // console.log("token: " + accessToken);
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getAssets`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if(!res.ok) {
                //console.log("error!");
                const errorBody = await res.json(); 
            
                throw { status: res.status, body: errorBody };
            }
            var data = await res.json();
            data = data.filter(asset => asset.Deleted == 0)
            setAssets(data);
        } catch (err) {
            console.error("Error fetching assets: ", err);
            if(err.status === 401){
                setError("You do not have permission to view the asset database.")
            }
            else{
                setError(`Error ${err.status}: ${err.body}`)
            }
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
                    <div className='block text-center'>
                        <h1 className='text-4xl font-bold mb-4'>Loading...</h1>
                        <br />
                        <p>Please note, the database can take up to a minute to turn on from sleep.</p>
                    </div>
                    
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-50 w-50 border-t-6 border-b-6 border-club-orange-300 dark:border-club-green-500"></div>
                </div>
                </>
            ) : (
                    <>
                        <form onSubmit={handleSubmit} className='sticky top-20 z-11 w-full pb-4 flex gap-2'>
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
                            <AssetTable assets={filteredAssets} edit={editPerms}/>   
                        ) : (
                            !error && <p>No assets found.</p>
                        )}
                        
                  </>
            )}            
        </div>
    )
}

