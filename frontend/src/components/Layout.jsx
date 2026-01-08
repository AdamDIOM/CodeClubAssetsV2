import { Link } from "react-router-dom";
import AuthButtons from "./AuthButtons";
import { useState } from "react";
import AuthName from "./AuthName";

export default function Layout({children}) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white bg-club-orange-100 dark:bg-club-green-950">
            <header className="sticky top-0 z-40 bg-club-green-300 dark:bg-club-orange-800 text-black dark:text-white p-4 shadow">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/">
                            <img src="/code-club-light.png" className="inline dark:hidden h-7 w-auto" />
                            <img src="/code-club-dark.png" className="hidden dark:inline h-7 w-auto"/>

                        </Link>
                        <nav className="relative hidden md:flex space-x-4">
                            {/* Assets Dropdown */}
                            <div className="relative group">
                                <Link to="/assets" className="hover:underline">Assets
                                </Link>
                                
                                <span className="inline-block text-xs transform transition-transform group-hover:-translate-y-0.5 duration-500 group-hover:rotate-180 pl-1 pr-1">▼</span>
                                <div className="
                                    pointer-events-none absolute left-0 top-full z-50 w-44 pt-2
                                    opacity-0 translate-y-1
                                    transition-all duration-200 ease-out
                                    group-hover:pointer-events-auto
                                    group-hover:opacity-100
                                    group-hover:translate-y-0
                                    rounded-md bg-club-green-300 dark:bg-club-orange-800
                                    text-black dark:text-white shadow-lg
                                    ">
                                <Link to="/assets/new" className="block px-4 py-2 text-sm hover:underline">New</Link>
                                </div>
                            </div>

                            {/* Loans Dropdown */}
                            <div className="relative group">
                                <Link to="/loans" className="hover:underline">Loans</Link>

                                <span className="inline-block text-xs transform transition-transform group-hover:-translate-y-0.5 duration-500 group-hover:rotate-180 pl-1 pr-1">▼</span>
                                <div className="
                                    pointer-events-none absolute left-0 top-full z-50 w-44 pt-2
                                    opacity-0 translate-y-1
                                    transition-all duration-200 ease-out
                                    group-hover:pointer-events-auto
                                    group-hover:opacity-100
                                    group-hover:translate-y-0
                                    rounded-md bg-club-green-300 dark:bg-club-orange-800
                                    text-black dark:text-white shadow-lg
                                    ">
                                <Link to="/loans/new" className="block px-4 py-2 text-sm hover:underline">New</Link>
                                <Link to="/loans/return" className="block px-4 py-2 text-sm hover:underline">Return</Link>
                                </div>
                            </div>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span><AuthName prefix="Hello, " /></span>
                        <AuthButtons className="hidden md:block" />
                    </div>
                    <button
                        className="md:hidden ml-2 focus:outline-none"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                        >
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Offcanvas Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-club-green-300 dark:bg-club-orange-800 text-black dark:text-white p-6 transform transition-transform duration-300 ease-in-out z-50
                ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <button
                onClick={() => setMenuOpen(false)} 
                aria-label="Close menu"
                className="mb-6 text-xl font-bold focus:outline-none"
                >
                ✕ Close
                </button>
                <nav className="flex flex-col space-y-4 text-lg">
                <Link
                    to="/assets"
                    className="hover:underline"
                    onClick={() => setMenuOpen(false)}
                >
                    Assets
                </Link>
                <Link
                    to="/assets/new"
                    className="hover:underline"
                    onClick={() => setMenuOpen(false)}
                >
                    New
                </Link>
                <Link
                    to="/loans"
                    className="hover:underline"
                    onClick={() => setMenuOpen(false)}
                >
                    Loans
                </Link>

                    <span><AuthName prefix="Signed in as " /></span>
                    <AuthButtons />
                </nav>
            </div>

            {/* Overlay */}
            {menuOpen && (
                <div
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40"
                aria-hidden="true"
                />
            )}

            <main className="grow max-w-6xl mx-auto pt-4 pb-4">
                {children}
            </main>

            <footer className="bg-club-orange-100 dark:bg-club-green-950 text-center py-2 text-sm text-gray-600 dark:text-gray-300">
                &copy; {new Date().getFullYear()} <Link to="https://codeclub.im" className="hover:underline">Code Club</Link>
            </footer>
        </div>
    )
}