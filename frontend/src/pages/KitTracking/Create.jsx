import { useState } from "react"
import { useMsal } from "@azure/msal-react"
import Toast from "../../components/Toast";
import { useEffect } from "react";
import { checkPermissions } from "../../components/CheckPermissions";
import { useRef } from "react";
import { m } from "framer-motion";

function GenericInput(props) {
    return (
        <>
            <input name={props.name} id={props.name} placeholder={props.placeholder} value={props.value} onChange={props.onChange} required={props.required} disabled={props.disabled} className="mx-auto w-full p-2 mb-0 mt-4 border rounded focus:outline-none focus:ring-2 focus:ring-club-orange-300 focus:dark:ring-club-green-500 bg-white dark:bg-neutral-800 disabled:bg-gray-100 dark:disabled:bg-neutral-700 disabled:text-gray-700 dark:disabled:text-gray-200 placeholder-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed disabled:opacity-70" list={props.list}/>
            {props.label && (
                <label htmlFor={props.name} className="text-xs text-gray-400 mb-4 p-2 block">{props.label}</label>
            )}
        </>
    )
}

function MultiInput({ values, onChange, placeholder, onScan, dropdowns }) {
  const [input, setInput] = useState("")
  const [disabled, setDisabled] = useState(false)
  const inputRef = useRef(null)
  
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const addValue = async() => {
    if (!input.trim()) return
    const value = await onScan(input.trim())
    if(value && value.Name && value.ID){
        onChange([...values, value])
        setInput("")
    }
    else{
        
    }
    setDisabled(false)
        inputRef.current.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
        setDisabled(true)
      e.preventDefault()
      addValue()
    }
  }

  function removeValue(index) {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className="mx-auto mt-4 w-full rounded border p-2 bg-white dark:bg-neutral-800 focus-within:ring-2 focus-within:ring-club-orange-300 focus-within:dark:ring-club-green-500 disabled:bg-gray-100 disabled:dark:bg-neutral-700 disabled:text-gray-700 disabled:dark:text-gray-200 disabled:cursor-not-allowed disabled:border-gray-400 disabled:opacity-70 disabled:ring-0 disabled:border">
      <div className="flex flex-wrap gap-2">
        {values.map((value, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded bg-gray-100 dark:bg-neutral-700 px-2 py-1 text-sm disabled:bg-gray-100 disabled:dark:bg-neutral-700 disabled:text-gray-700 disabled:dark:text-gray-200 disabled:cursor-not-allowed disabled:border-gray-400 disabled:opacity-70 disabled:ring-0 disabled:border"
          >
            {value.Name}
            <button
              type="button"
              onClick={() => removeValue(i)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-md"
            >
              ×
            </button>
          </span>
        ))}

        <input
          value={input}
          placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] border-none p-1 outline-none bg-transparent placeholder-gray-400 disabled:bg-gray-100 disabled:dark:bg-neutral-700 disabled:text-gray-700 disabled:dark:text-gray-200 disabled:cursor-not-allowed disabled:border-gray-400 disabled:opacity-70 disabled:ring-0 disabled:border"
          ref={inputRef}
          disabled={disabled}
          list="MembersList"
        />

        <datalist id="MembersList">
          {dropdowns.map((member, i) => (
            <option key={i} value={member.Name} />
          ))}
        </datalist>
      </div>
    </div>
  )
}

export default function CreateKT() {
    const { instance, accounts } = useMsal();
    const [form, setForm] = useState({ AssetID: '', DefaultUseLength: 0, Members: [] });
    const [message, setMessage] = useState(null);

    const [toast, setToast] = useState(null)
    const [closeToast, setCloseToast] = useState(false)

    const [editPerms, setEditPerms] = useState(false)
    const [viewPerms, setViewPerms] = useState(false)

    const [assetsList, setAssetsList] = useState([]);

    const [clear, setClear] = useState(false);

    const [processState, setProcessState] = useState(0)
    const [codes, setCodes] = useState([])

    const [members, setMembers] = useState([])
    // 0 = loading; 1 = start; 2 = loading-asset-check; 3 = member-input

    const handleChange = e => {
        const {name, value} = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        console.log("process: " + processState)
        if(processState == 1){
            setProcessState(0)
        }
        else{
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
                const errorBody = await res.json(); // or res.json() if your backend returns JSON
                throw { status: res.status, body: errorBody };
            }
            var reply = await res.json()

            if(toast){
                setCloseToast(true);
                const timer = setTimeout(() => {setToast(reply)}, 400);
            } else {
                setToast(reply)
            }

            if(!clear){
                setForm({ ID: '', Name: '', Description: null, Location: null, SerialNumber: null, ParentID: null, Tags: null, TestsRequired: 0 })
            } else {
                setForm({ ...form, ID: '', SerialNumber: ''})
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
    }

    const fetchAssets = async() => {
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
                    'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`,
                    Filter: "KT"
                }
            });

            if(!res.ok) {
                console.log("error!");
                const errorBody = await res.json(); 
            
                throw { status: res.status, body: errorBody };
            }
            var data = await res.json();
            setAssetsList(data);
        } catch (err) {
            console.error("Error fetching assets: ", err);
            if(err.status === 401){
                setMessage("You do not have permission to view the asset database.")
            }
            else{
                setMessage(`Error ${err.status}: ${err.body}`)
            }
        }finally {

            setProcessState(1);
        };
    };

    useEffect(() => {
        if(accounts.length === 0 ) {
            return;
        }
        fetchAssets();
        }, [accounts]);


        const handleAssetCheck = async (e) => {
            e.preventDefault();
            setProcessState(2)
            setMessage(null);
            //console.log(form.AssetID);
            //console.log(assetsList)
            const assetExists = assetsList.find(asset => asset.ID === form.AssetID);
            if(!assetExists) {
                setMessage(`Error: Asset does not exist`)
                setProcessState(1);
                return;
            }
            if (!accounts.length) return;
            const request = {
                scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
                account: accounts[0]
            };

            try {
                const tokenResponse = await instance.acquireTokenSilent(request);
                const accessToken = tokenResponse.accessToken;

                const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getTrackedKit`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`,
                        AssetID: form.AssetID
                    }
                });

                if(!res.ok) {
                    console.log("error!");
                    const errorBody = await res.json(); 
                
                    throw { status: res.status, body: errorBody };
                }
                var data = await res.json();

                const resMembers = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getMember`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`,
                        Flag: "All"
                    }
                });

                if(!resMembers.ok) {
                    console.log("error!");
                    const errorBody = await resMembers.json();

                    throw { status: resMembers.status, body: errorBody };
                }

                var dataMembers = await resMembers.json();
                console.log(dataMembers)
                setMembers(dataMembers);

                if(data.length > 0){
                    setMessage(`Error: ${form.AssetID} is already checked out in an active Kit Tracking instance.`)
                    setProcessState(1);
                }
                else{
                    form.DefaultUseLength = assetsList.find(asset => asset.ID === form.AssetID)?.DefaultUseLength
                    setProcessState(3)
                }


                
                
            } catch (err) {
                console.error("Error fetching assets: ", err);
                if(err.status === 401){
                    setMessage("You do not have permission to view the asset database.")
                }
                else{
                    setMessage(`Error ${err.status}: ${err.body}`)
                }
            }finally {

            };
        }

        const processMember = async (val) => {

                    setMessage("")
            if (!accounts.length) return;
                const request = {
                    scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
                    account: accounts[0]
                };
                setProcessState(4)
                try {
                    var res;
                    if(val.startsWith("https://mmjo.me")) {
                    const tokenResponse = await instance.acquireTokenSilent(request);
                    const accessToken = tokenResponse.accessToken;

                    res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getMember`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`,
                            MMID: val.replace("https://mmjo.me/","")
                        }
                    });
                }
                else if (Number.isInteger(parseInt(val))) {
                    const tokenResponse = await instance.acquireTokenSilent(request);
                    const accessToken = tokenResponse.accessToken;

                    res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getMember`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`,
                            ID: val
                        }
                    });
                }
                else {
                    const tokenResponse = await instance.acquireTokenSilent(request);
                    const accessToken = tokenResponse.accessToken;

                    res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/getMember`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`,
                            Name: val
                        }
                    });
                }
                    if(!res.ok) {
                        console.log("error!");
                        const errorBody = await res.json(); 
                    
                        throw { status: res.status, body: errorBody };
                    }
                    var data = await res.json();
                    console.log(data[0]);
                    setProcessState(5);
                    return(data[0])
                } catch (err) {
                    console.error("Error fetching assets: ", err);
                    setMessage("Error: Member not found")
                    if (form.Members.length == 0) {
                    setProcessState(3);
                    }
                    else{
                        setProcessState(5);
                    }
                    return null;
                };
            
        }
    
        const handleFinalise = async (e) => {
            e.preventDefault();
            setProcessState(6);
            const memberIDs = form.Members.map(member => member.ID);

            const submit = { AssetID: form.AssetID, DefaultUseLength: form.DefaultUseLength, Members: memberIDs }
            console.log(submit)

            try {
            const request = {
                scopes: [import.meta.env.VITE_BACKEND_API_SCOPE],
                account: accounts[0]
            };

            const tokenResponse = await instance.acquireTokenSilent(request);
            const accessToken = tokenResponse.accessToken;

            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/createTrackedKit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-functions-key': `${import.meta.env.VITE_CREATE_API_KEY}`
                },
                body: JSON.stringify(submit)
            });


            if(!res.ok) {
                const errorBody = await res.json(); // or res.json() if your backend returns JSON
                throw { status: res.status, body: errorBody };
            }
            var reply = await res.json()

            if(toast){
                setCloseToast(true);
                const timer = setTimeout(() => {setToast(reply)}, 400);
            } else {
                setToast(reply)
            }

            setForm({ AssetID: '', DefaultUseLength: 0, Members: [] })
            setProcessState(1)
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
        <div className="sm:max-w-xl max-w-4/5 mx-auto ">
            
            <h1 className="text-2xl font-bold mb-4">Create New Kit Tracking Instance</h1>
            <form className="space-y-4 sm:block  ">
                
                { processState == 0 ? (
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
                )
                :
                (processState > 0) && (
                    <>
                        <GenericInput name="AssetID" placeholder="Asset ID" value={form.AssetID} onChange={handleChange} required list="Assets" disabled={processState>1}/>
                        <datalist id="Assets">
                            {assetsList.map((asset) => (
                                <option key={asset.ID} value={asset.ID} />
                            ))}
                        </datalist>
                        {processState < 3 && (<button type="submit" onClick={handleAssetCheck} className="w-full bg-white ring-2 ring-club-orange-300 dark:ring-club-green-500 dark:bg-neutral-800 hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 px-4 py-2 rounded text-neutral-700 dark:text-neutral-300 cursor-pointer mt-4">Check Availability</button>)}
                        
                        {processState > 2 && (
                            <>
                                <GenericInput name="DefaultUseLength" placeholder="Length Kept" value={form.DefaultUseLength} onChange={handleChange} label="This is how long (in days) the asset is reserved for the below named individual(s)"/>
                                <MultiInput
                                    values={form.Members}
                                    onChange={members => setForm({ ...form, Members: members })}
                                    onScan={processMember}
                                    placeholder="Scan member cards..."
                                    dropdowns={members}
                                     />
                                    {processState >= 5 && (
                                    <button type="submit" onClick={handleFinalise} className="w-full bg-white ring-2 ring-club-orange-300 dark:ring-club-green-500 dark:bg-neutral-800 hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 px-4 py-2 rounded text-neutral-700 dark:text-neutral-300 cursor-pointer mt-4 disabled:bg-gray-100 disabled:dark:bg-neutral-700 disabled:text-gray-700 disabled:dark:text-gray-200 disabled:cursor-not-allowed disabled:border-gray-400 disabled:opacity-70 disabled:ring-0 disabled:border" disabled={processState == 6}>Confirm</button>
                                    )}
                        </>
                    )}
                    {(processState == 2 || processState == 4 || processState == 6) && (
                            <div className="flex justify-center items-center h-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-6 border-b-6 border-club-orange-300 dark:border-club-green-500"></div>
                            </div>
                        )}
                    </>
                )}

                



                
            </form>
            {message && <p className="mt-4 text-red-600">{message}</p>}
            {toast && <Toast message={toast} onClose={() => {setToast(null); setCloseToast(false)}} close={closeToast} />
            }
        </div>
    )
}