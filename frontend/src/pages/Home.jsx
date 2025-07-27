import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { Link } from "react-router-dom";

export default function Home() {

    const { instance } = useMsal();
    const account = instance.getActiveAccount();
    
    {/* Feature component */}
    function Feature({ title, description, link, onclick }) {
    return (
        <Link to={link} onClick={onclick}>

            <div className="p-4 border border-club-orange-300 dark:border-club-green-500 rounded-lg shadow-sm bg-white dark:bg-neutral-800">
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-neutral-700 dark:text-neutral-300">{description}</p>
            </div>
        </Link>
    );
    }
    
    return (
        <>
            <section className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Code Club Asset Management System</h1>
                <p className="text-lg max-w-xl mx-auto">
                    The one place to track all your assets, manage loans and returns, and keep your inventory organised!
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                    <Feature title="Easy Asset Tracking" description="Add, view, edit, and delete assets quickly and efficiently." link="/assets" />
                    <Feature title="Loan Management" description="Loan out and return items with a few clicks." link="/loans" />
                    <AuthenticatedTemplate>
                        <Feature title="Secure Access" description={`Securely logged in ${account?.name ? "as " + account.name : "using Microsoft 365" }.`} />
                    </AuthenticatedTemplate>
                    <UnauthenticatedTemplate>
                        <div >
                            <Feature title="Secure Access" description={`Log in using Microsoft 365.`} onclick={() => instance.loginRedirect()} />
                        </div>
                    </UnauthenticatedTemplate>
                    <Feature title="PAT Support" description="Coming in a later update." />    
                </div>
                
            </section>
        </>
    )
}