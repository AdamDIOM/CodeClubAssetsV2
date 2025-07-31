const isLocalhost = window.location.hostname === "localhost";

export const msalConfig = {
    auth: {
        clientId: "b0ce37b8-4872-4f7d-b249-af7448c5db35",
        authority: "https://login.microsoftonline.com/5eb26f0a-532d-45f6-b1b4-58c84e52a7c5",
        redirectUri: isLocalhost
        ? "http://localhost:5173/"
        : "https://assets-dev.codeclub.im/",
        navigateToLoginRequestUrl: false,
    },
//     system: {
//     loggerOptions: {
//       loggerCallback: (level, message) => console.log(message),
//       logLevel: 2, // info
//       piiLoggingEnabled: false
//     }
//   },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
    }
}