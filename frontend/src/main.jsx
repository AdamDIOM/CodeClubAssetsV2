import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { EventType, PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authConfig.js';
import { MsalProvider } from '@azure/msal-react';

const msalInstance = new PublicClientApplication(msalConfig)

await msalInstance.initialize();

msalInstance.addEventCallback((event) => {
  if(event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
    msalInstance.setActiveAccount(event.payload.account);
  }
})

msalInstance.handleRedirectPromise().then(() => {
  const account = msalInstance.getActiveAccount();
  if(!account){
    console.log("not account")
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }




const redirect = sessionStorage.getItem('postLoginRedirect');
if(redirect) {
  sessionStorage.removeItem('postLoginRedirect');
  window.location.replace(redirect);
}

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  // </StrictMode>
)
});