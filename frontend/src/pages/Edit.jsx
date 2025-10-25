import { useMsal } from "@azure/msal-react";
import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { checkPermissions } from "../components/CheckPermissions";
import Toast from "../components/Toast";

const EditPermsContext = createContext(true);
export const useEditPerms = () => useContext(EditPermsContext);

function GenericInput(props) {
    var disabled = props.disabled
    const editPerms = useEditPerms();
    if(!editPerms) disabled = true
    return (
        <input name={props.name} placeholder={props.placeholder} value={props.value} onChange={props.onChange} required={props.required} disabled={disabled} className="mx-auto w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 disabled:bg-gray-100 dark:disabled:bg-neutral-700 disabled:text-gray-700 dark:disabled:text-gray-200 placeholder-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed disabled:opacity-70" />
    )
}


export default function Edit() {


    const { id } = useParams()

    const { instance, accounts } = useMsal();
    const [form, setForm] = useState({ ID: '', Name: '', Description: null, Location: null, SerialNumber: null, ParentID: null, Tags: null, TestsRequired: 0 });

    const [originalData, setOriginalData] = useState({ ID: '', Name: '', Description: null, Location: null, SerialNumber: null, ParentID: null, Tags: null, TestsRequired: 0 })

    const [message, setMessage] = useState(null);

    const [toast, setToast] = useState(null)
    const [closeToast, setCloseToast] = useState(false)

    const [editPerms, setEditPerms] = useState(false)
    const [viewPerms, setViewPerms] = useState(false)

    const [downloading, setDownloading] = useState(false);
    const [uploading, setUploading] = useState(false)

    const [changed, setChanged] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const handleChange = e => {
        setChanged(true);
        const {name, value} = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleDelete = () => {
        setDeleting(true)
    }

    const handleConfirmedDelete = async () => {
        setDeleting(false)
        try {
            const request = {
                scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
                account: accounts[0]
            };

            const tokenResponse = await instance.acquireTokenSilent(request);
            const accessToken = tokenResponse.accessToken;

            setUploading(true)
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/deleteAsset/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`
                }
            });

            setUploading(false)

            if(!res.ok) {
                const errorBody = await res.json(); 
                throw { status: res.status, body: errorBody };
            }
            var reply = await res.json()

            if(toast){
                setCloseToast(true);
                const timer = setTimeout(() => {setToast(reply)}, 400);
            } else {
                setToast(reply)
            }
            form.Deleted = 1;
            setEditPerms(false)
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

    const handleCancelledDelete = () => {
        setDeleting(false)
    }

    const handleUnDelete = async () => {
        try {
            const request = {
                scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
                account: accounts[0]
            };

            const tokenResponse = await instance.acquireTokenSilent(request);
            const accessToken = tokenResponse.accessToken;

            console.log("Undeleting")
            setUploading(true)
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/unDeleteAsset/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`
                }
            });

            console.log("Undeleted")
            setUploading(false)

            if(!res.ok) {
                const errorBody = await res.json(); 
                throw { status: res.status, body: errorBody };
            }
            var reply = await res.json()

            if(toast){
                setCloseToast(true);
                const timer = setTimeout(() => {setToast(reply)}, 400);
            } else {
                setToast(reply)
            }
            const x = await checkPermissions(accessToken);
            if(x.includes('db_datawriter')) {
                setEditPerms(true)
            }
            form.Deleted = 0;
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
    
                const x = await checkPermissions(accessToken);
                if(x.includes('db_datawriter')) {
                    setEditPerms(true)
                } else {
                    setMessage("You do not have permission to edit the asset database.")
                }

                if(x.includes('db_datareader')) setViewPerms(true)
                const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getAssets`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        ID: id
                    }
                });
    
                if(!res.ok) {
                    console.log("error!");
                    const errorBody = await res.json(); 
                
                    throw { status: res.status, body: errorBody };
                }
                var data = await res.json();
                if(data.length < 1){
                    setViewPerms(false)
                    throw {status: 404, body: "Asset not found"}
                }
                if(data[0].Deleted == 1) setEditPerms(false)
                setForm(data[0]);
                setOriginalData(data[0])
            } catch (err) {
                console.error("Error fetching assets: ", err);
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
                //setDownloading(true)
                return;
            }
            //setDownloading(true)
            fetchAsset();
        }, [accounts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null)

        try {
            const request = {
                scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
                account: accounts[0]
            };

            const tokenResponse = await instance.acquireTokenSilent(request);
            const accessToken = tokenResponse.accessToken;

            console.log("Putting")
            setUploading(true)
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/updateAsset`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`
                },
                body: JSON.stringify([form, originalData])
            });

            console.log("Put")
            setUploading(false)

            if(!res.ok) {
                const errorBody = await res.json(); 
                throw { status: res.status, body: errorBody };
            }
            var reply = await res.json()

            if(toast){
                setCloseToast(true);
                const timer = setTimeout(() => {setToast(reply)}, 400);
            } else {
                setToast(reply)
            }
            setOriginalData(form);
            setChanged(false);
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

    return (
        <EditPermsContext.Provider value={editPerms}>
        <div className="sm:max-w-xl max-w-4/5 mx-auto ">
                    
            <h1 className="text-2xl font-bold mb-4">Edit Asset {id}</h1>
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
            ) : viewPerms ? (
                <>
            <form onSubmit={handleSubmit} className="space-y-4 sm:block  ">
                <GenericInput name="ID" placeholder="ID" value={form.ID} onChange={handleChange} required disabled />
                <GenericInput name="Name" placeholder="Name" value={form.Name} onChange={handleChange} required />
                <GenericInput name="Description" placeholder="Description" value={form.Description} onChange={handleChange} />
                <GenericInput name="Location" placeholder="Location" value={form.Location} onChange={handleChange} />
                <GenericInput name="SerialNumber" placeholder="Serial Number" value={form.SerialNumber} onChange={handleChange} />
                <GenericInput name="ParentID" placeholder="Parent ID" value={form.ParentID} onChange={handleChange} />
                <GenericInput name="Tags" placeholder="Tags (separated by ;)" value={form.Tags} onChange={handleChange} />
                {uploading
                ? (
                    <>
                    <button type="submit" disabled className="w-full ring-2 ring-club-orange-300 dark:ring-club-green-500 bg-club-orange-400 dark:bg-club-green-800 px-4 py-2 rounded text-neutral-700 dark:text-neutral-300 cursor-wait font-semibold">Updating...</button>

                    <div className="flex justify-center items-center h-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-6 border-b-6 border-club-orange-300 dark:border-club-green-500"></div>
                    </div>
                    <div className="flex justify-center items-center">
                        <div className='block text-center'>
                            <p>Please note, the database can take up to a minute to turn on from sleep.</p>
                        </div>
                        
                    </div>
                    
                    </>
                )
                : editPerms && ( changed ? 
                <button type="submit" className="w-full bg-white ring-2 ring-club-orange-300 dark:ring-club-green-500 dark:bg-neutral-800 hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 px-4 py-2 rounded text-neutral-700 dark:text-neutral-300 cursor-pointer font-semibold">Save</button>
            :
            <button type="submit" disabled className="w-full border bg-gray-100 dark:bg-neutral-700 px-4 py-2 rounded text-gray-700 dark:text-gray-200 cursor-not-allowed border-gray-400 opacity-70 font-semibold">Save</button>
        )
                }

            

                {message && <p className="mt-4 text-red-600">{message}</p>}
            </form>
            {form.Deleted == 0 ? 
            <button className="w-full bg-white ring-2 ring-red-500 dark:bg-neutral-800 hover:bg-red-500 hover:ring-red-300 hover:dark:bg-red-700 active:bg-red-300 active:ring-red-500 active:dark:bg-red-900 active:dark:ring-red-500 px-4 py-2 mt-8 rounded text-neutral-700 dark:text-neutral-300 cursor-pointer font-semibold" onClick={handleDelete}>Delete</button>
            :
            <button className="w-full bg-white ring-2 ring-club-orange-300 dark:ring-club-green-500 dark:bg-neutral-800 hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 px-4 py-2 rounded text-neutral-700 dark:text-neutral-300 cursor-pointer font-semibold mt-8" onClick={handleUnDelete}>Un-Delete</button>}
            </>
            ):
            
                <>{message && <p className="mt-4 text-red-600">{message}</p>}</>
            }
            {toast && <Toast message={toast} onClose={() => {setToast(null); setCloseToast(false)}} close={closeToast} />
            }
            {deleting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 max-w-sm w-full mx-4">
                        <h2 className="text-lg font-bold mb-2 text-center">
                        Confirm Deletion
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                        Are you sure you want to delete <b>{id}</b>?
                        </p>

                        <div className="flex justify-center gap-3">
                        <button
                            onClick={handleConfirmedDelete}
                            className="px-4 py-2 rounded-lg font-semibold cursor-pointer ring-2 ring-red-400 bg-red-600 hover:bg-red-400 hover:ring-red-600 dark:hover:ring-red-400 dark:hover:bg-red-700 active:bg-red-500 active:ring-red-300 dark:active:ring-red-400 dark:active:bg-red-900 text-white"
                        >
                            Delete
                        </button>
                        <button
                            onClick={handleCancelledDelete}
                            className="px-4 py-2 rounded-lg font-semibold cursor-pointer ring-2 ring-club-orange-300 dark:ring-club-green-500 dark:bg-neutral-800 hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 text-neutral-700 dark:text-neutral-300"
                        >
                            Cancel
                        </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </EditPermsContext.Provider>
    )
}