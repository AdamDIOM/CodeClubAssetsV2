import { Link } from "react-router-dom";
import AuthButtons from "./AuthButtons";

export default function Layout({children}) {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-bold"><Link to="/">Assets</Link></h1>
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

            <main className="flex-grow max-w-6xl mx-auto p-4">
                {children}
            </main>

            <footer className="bg-blue-100 dark:bg-blue-950 text-center py-2 text-sm text-gray-600 dark:text-gray-300">
                &copy; {new Date().getFullYear()} Code Club
            </footer>
        </div>
    )
}