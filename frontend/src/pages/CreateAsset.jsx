import { useState } from "react"
import { useMsal } from "@azure/msal-react"

export default function Create() {
    const { instance, accounts } = useMsal();
    const [form, setForm] = useState({ ID: '', Name: '', Description: '', Location: '', SerialNumber: '', ParentID: '', Tags: '', TestsRequired: 0, Out: 0 });
    const [message, setMessage] = useState(null);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

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

            console.log(accessToken)

            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/createAsset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`
                },
                body: JSON.stringify(form)
            });

            if(!res.ok) {
                throw new Error(`Failed to create asset: ${res.status}`);
            }
            setMessage("Asset created successfully!");
            setForm({ ID: '', Name: '', Description: '', Location: '', SerialNumber: '', ParentID: '', Tags: '', TestsRequired: 0, Out: 0 })
        } catch (err) {
            console.error(err);
            setMessage("Error creating asset: ", err)
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create New Asset</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="ID" placeholder="ID" value={form.ID} onChange={handleChange} required className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800" />
                <input name="Name" placeholder="Name" value={form.Name} onChange={handleChange} required className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800" />
                <input name="Description" placeholder="Description" value={form.Description} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800" />
                <input name="Location" placeholder="Location" value={form.Location} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800" />
                <input name="SerialNumber" placeholder="Serial Number" value={form.SerialNumber} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800" />
                <input name="ParentID" placeholder="Parent ID" value={form.ParentID} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800" />
                <input name="Tags" placeholder="Tags (separated by ;)" value={form.Tags} onChange={handleChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800" />
                <button type="submit" className="w-full bg-white ring-2 ring-club-orange-300 dark:ring-club-green-500 dark:bg-neutral-800 hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 px-4 py-2 rounded text-neutral-700 dark:text-neutral-300">Submit</button>
            </form>
            {message && <p className="mt-4">{message}</p>}
        </div>
    )
}