import { useState } from "react"
import { useMsal } from "@azure/msal-react"

export default function Create() {
    const { instance, accounts } = useMsal();
    const [form, setForm] = useState({ ID: '', Name: '', Description: '', Location: '', SerialNumber: '', ParentID: '', Tags: '', TestsRequired: 0, Out: 0 });
    const [message, setMessage] = useState(null);

    const [loading, setLoading] = useState(false);

    const [clear, setClear] = useState(false);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleToggle = e => {
        setClear(e.target.checked)
    }

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

            //console.log(accessToken)
            console.log("Posting")
            setLoading(true)
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/createAsset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`
                },
                body: JSON.stringify(form)
            });

            console.log("Posted")
            setLoading(false)

            if(!res.ok) {
                throw new Error(res.status);
            }
            var reply = await res.json()
            setMessage(reply);
            if(!clear){
                setForm({ ID: '', Name: '', Description: '', Location: '', SerialNumber: '', ParentID: '', Tags: '', TestsRequired: 0, Out: 0 })
            } else {
                setForm({ ...form, ID: '', SerialNumber: ''})
            }
        } catch (err) {
            if(err.message === "403"){
                setMessage("You do not have permission to modify the asset database.")
            }
            else{
                setMessage(`${err} whilst trying to create asset`)
            }
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            {loading ? <p>Loading...</p> : <></>}
            <h1 className="text-2xl font-bold mb-4">Create New Asset</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="ID" placeholder="ID" value={form.ID} onChange={handleChange} required className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 placeholder-gray-400" />
                <input name="Name" placeholder="Name" value={form.Name} onChange={handleChange} required className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 placeholder-gray-400" />
                <input name="Description" placeholder="Description" value={form.Description} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 placeholder-gray-400" />
                <input name="Location" placeholder="Location" value={form.Location} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 placeholder-gray-400" />
                <input name="SerialNumber" placeholder="Serial Number" value={form.SerialNumber} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 placeholder-gray-400" />
                <input name="ParentID" placeholder="Parent ID" value={form.ParentID} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 placeholder-gray-400" />
                <input name="Tags" placeholder="Tags (separated by ;)" value={form.Tags} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 placeholder-gray-400" />
                <input name="Clear" id="clearCheckbox" type="checkbox" class="hidden peer" value={form.Clear} onChange={handleToggle} />
                <label for="clearCheckbox" className="inline-block w-full p-2 border rounded 
                peer-checked:ring-2 ring-club-orange-300 dark:ring-club-green-500
                dark:bg-neutral-800
                peer-checked:bg-club-orange-100 peer-checked:dark:bg-club-green-600
                active:bg-club-orange-400 dark:active:bg-club-green-800
                px-4 py-2 rounded
                text-neutral-700 dark:text-neutral-300 cursor-pointer
                ">Create Similar</label>
                {loading
                ? 
                <button type="submit" disabled className="w-full bg-white ring-2 ring-club-orange-300 dark:ring-club-green-500 dark:bg-neutral-800 hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 px-4 py-2 rounded text-neutral-700 dark:text-neutral-300 cursor-wait">Creating...</button>
                :
                <button type="submit" className="w-full bg-white ring-2 ring-club-orange-300 dark:ring-club-green-500 dark:bg-neutral-800 hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 px-4 py-2 rounded text-neutral-700 dark:text-neutral-300 cursor-pointer ">Submit</button>
                }
                
            </form>
            {message && <p className="mt-4">{message}</p>}
        </div>
    )
}