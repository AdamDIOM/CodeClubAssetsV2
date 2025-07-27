import { Link } from "react-router-dom";
import AuthButtons from "./AuthButtons";

export default function Layout({children}) {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
            <header className="bg-club-green-300 dark:bg-club-orange-800 text-black dark:text-white p-4 shadow">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/">
                            <img src="code-club-light.png" className="inline dark:hidden h-7 w-auto" />
                            <img src="code-club-dark.png" className="hidden dark:inline h-7 w-auto"/>

                        </Link>
                        <nav className="space-x-4">
                            <Link to="/assets" className="hover:underline">Assets</Link>
                            <Link to="/assets/new" className="hover:underline">New</Link>
                            <Link to="/loans" className="hover:underline">Loans</Link>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-2">
                        <AuthButtons />
                    </div>
                </div>
            </header>

            <main className="grow max-w-6xl mx-auto p-4">
                {children}
            </main>

            <footer className="bg-club-orange-100 dark:bg-club-green-950 text-center py-2 text-sm text-gray-600 dark:text-gray-300">
                &copy; {new Date().getFullYear()} <Link to="https://codeclub.im" className="hover:underline">Code Club</Link>
            </footer>
        </div>
    )
}