import { useMsal } from "@azure/msal-react";
import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { checkPermissions } from "../../components/CheckPermissions";
import Toast from "../../components/Toast";


function GenericInput(props) {
    var disabled = props.disabled
    const editPerms = useEditPerms();
    if(!editPerms) disabled = true
    return (
        <>
            <input name={props.name} id={props.name} placeholder={props.placeholder} value={props.value} onChange={props.onChange} required={props.required} disabled={disabled} className="mx-auto w-full p-2 mb-0 mt-4 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 disabled:bg-gray-100 dark:disabled:bg-neutral-700 disabled:text-gray-700 dark:disabled:text-gray-200 placeholder-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed disabled:opacity-70" />
            {props.label && (
                <label htmlFor={props.name} className="text-xs text-gray-400 mb-0 p-2 pb-0 block">{props.label}</label>
            )}
        </>
    )
}


export default function SelfRenewKT() {


    const { id } = useParams()

    const { instance, accounts } = useMsal();

    const [ktID, setKtID] = useState();
    const [originalDate, setOriginalDate] = useState("");

    const [message, setMessage] = useState(null);

    const [toast, setToast] = useState(null)
    const [closeToast, setCloseToast] = useState(false)


    const [downloading, setDownloading] = useState(false);






    const handleRenew = async () => {
        try {

                console.log(originalDate)
            const request = {
                scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
                account: accounts[0]
            };

            const tokenResponse = await instance.acquireTokenSilent(request);
            const accessToken = tokenResponse.accessToken;

            setDownloading(true)
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/aRenewTrackedKit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`
                },
                body: JSON.stringify([ktID, originalDate])
            });

            setDownloading(false)

            if(!res.ok) {
                const errorBody = await res.json(); 
                throw { status: res.status, body: errorBody };
            }
            var reply = await res.json()
            setOriginalDate(new Date())
            if(toast){
                setCloseToast(true);
                const timer = setTimeout(() => {setToast(reply)}, 400);
            } else {
                setToast(reply)
            }
        } catch (err) {
            console.log(err)
            if(err.status === "403"){
                setMessage("You do not have permission to modify the asset database.")
            }
            else{
                setMessage(`Error ${err.status}: ${err.body}`)
            }
        }
    }

    const fetchAsset = async() => {
            if (!accounts.length) return;
            const request = {
                scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
                account: accounts[0]
            };
    
            try {
                const tokenResponse = await instance.acquireTokenSilent(request);
                const accessToken = tokenResponse.accessToken;
                const resID = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getTrackedKit`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`,
                        'AssetID': id
                    }
                });

                if(!resID.ok) {
                    console.log("error!");
                    const errorBody = await resID.json(); 
                
                    throw { status: resID.status, body: errorBody };
                }

                var ktid = await resID.json();

                console.log(ktid)
                if(ktid.length < 1){
                    throw {status: 404, body: "Tracked Kit Instance not found"}
                }
    
                const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getTrackedKit`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`,
                        'ID': ktid[0].ID,
                        'Flag': 'selfRenew'
                    }
                });
    
                if(!res.ok) {
                    console.log("error!");
                    const errorBody = await res.json(); 
                
                    throw { status: res.status, body: errorBody };
                }
                var data = await res.json();
                if(data.length < 1){
                    throw {status: 404, body: "Tracked Kit Instance not found"}
                }
                if(data[0].History == 1) {
                    throw {status: 400, body: "Cannot renew a tracked kit instance that has been returned."}
                }
                setKtID(data[0].ID);
                setOriginalDate(data[0].LastUsed)
                console.log(data[0])
                console.log(originalDate)
            } catch (err) {
                console.error("Error fetching tracked kit instance: ", err);
                if(err.status === 401){
                    setMessage("You do not have permission to view the asset database.")
                }
                else{
                    setMessage(`Error ${err.status}: ${err.body}`)
                }
            }finally {
    
                setDownloading(false);
            };
        };

    useEffect(() => {
            if(accounts.length === 0 ) {
                setDownloading(true)
                return;
            }
            setDownloading(true)
            fetchAsset();
        }, [accounts]);

    return (
        <div className="sm:max-w-xl max-w-4/5 mx-auto ">
                    
            <h1 className="text-2xl font-bold mb-4">Renew Kit Instance {id}</h1>
            {downloading ? (
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

            {( new Date(originalDate).toDateString() != new Date().toDateString() ?
                <button className="w-full bg-white ring-2 ring-club-orange-300 dark:ring-club-green-500 dark:bg-neutral-800 hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 px-4 py-2 rounded text-neutral-700 dark:text-neutral-300 cursor-pointer font-semibold mt-4" onClick={handleRenew}>Renew</button>

                :
                <button disabled className="w-full border bg-gray-100 dark:bg-neutral-700 px-4 py-2 rounded text-gray-700 dark:text-gray-200 cursor-not-allowed border-gray-400 opacity-70 font-semibold mt-4">Kit Already Renewed Today</button>
            )}

            </>
            )
            }
            {toast && <Toast message={toast} onClose={() => {setToast(null); setCloseToast(false)}} close={closeToast} />
            }
            {message && <p className="mt-4 text-red-600">{message}</p>}
        </div>
    )
}