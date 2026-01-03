import { useMsal } from '@azure/msal-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoansTable from '../components/LoansTable';
import { checkPermissions } from '../components/CheckPermissions';


export default function Loans() {
    const { instance, accounts } = useMsal();
    const [ searchParams, setSearchParams] = useSearchParams();

    const initialSearch = searchParams.get('f') || '';
    const [searchInput, setSearchInput] = useState(initialSearch);

    const [loans, setLoans] = useState([]);
    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const [editPerms, setEditPerms] = useState(false)

    const fetchLoans = async() => {
        const request = {
            scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
            account: accounts[0]
        };

        try {
            const tokenResponse = await instance.acquireTokenSilent(request);
            const accessToken = tokenResponse.accessToken;
            
            const x = await checkPermissions(accessToken);
            if(x.includes('db_datawriter')) setEditPerms(true)

            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getLoans`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if(!res.ok) {
                const errorBody = await res.json(); 
            
                throw { status: res.status, body: errorBody };
            }
            const data = await res.json();
            setLoans(data);
        } catch (err) {
            console.error("Error fetching loans: ", err);
            if(err.status === 401){
                setError("You do not have permission to view the loans database.")
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
        fetchLoans();
    }, [accounts]);

    const filteredLoans = useMemo(() => {
        const term = searchInput.toLowerCase();
        console.log(loans)
        if(!term) return loans;
        return loans.filter(loan => 
            loan.AssetID?.toLowerCase().includes(term) || loan.AssetName?.toLowerCase().includes(term) || loan.MemberName.toLowerCase().includes(term)
        )
    }, [loans, searchInput])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = searchInput.trim()
        setSearchParams(trimmed? {f: trimmed} : {});
        await fetchLoans();
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
                    {filteredLoans.length ? (
                        <LoansTable loans={filteredLoans} edit={editPerms}/>   
                    ) : (
                        !error && <p>No loans found.</p>
                    )}
                    
                </>
            )}            
        </div>
    )
}