import { Link } from "react-router-dom";
import AuthButtons from "./AuthButtons";
import { useState } from "react";
import AuthName from "./AuthName";

export default function Layout({children}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const closeMenu = () => {
        setMenuOpen(false);
        setOpenDropdown(null);
    };

    function DropDownMenu(props) {
        return (
            <div className="relative group">
                <Link to={props.head_link} className="hover:underline">{props.head_text}
                </Link>
                
                <span className="inline-block text-xs transform transition-transform translate-y-0.5 duration-500 group-hover:rotate-180 pl-1 pr-1">
                    <svg className={`w-4 h-4`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/>
                    </svg>
                </span>
                
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
                    {props.items.map((item) => (
                        <Link to={item.link} className="block px-4 py-2 text-sm hover:underline" key={item.id}>
                            {item.text}
                        </Link>
                    ))}
                </div>
            </div>
        )
    }

    function OffCanvasDropDownMenu(props) {
        return (
            <div>
                <button className="flex justify-between w-full items-center px-2 py-2 hover:bg-club-orange-700 rounded" onClick={() => toggleDropdown(props.id)}>{props.head_text}
                    <svg className={`w-4 h-4 transform transition-transform ${openDropdown === props.id ? 'rotate-180' : 'rotate-0'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>

                {/* Dropdown items */}
                {openDropdown === props.id && (
                    props.items.map((item) => (
                        <div className="flex flex-col pl-4 mt-2 space-y-1" key={item.id}>
                            <Link to={item.link} className="block px-2 py-1 hover:bg-club-orange-600 rounded" onClick={() => {closeMenu()}}>{item.text}</Link>
                        </div>
                    ))
                )}
            </div>
        )
    }

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
                            <DropDownMenu head_link="/assets" head_text="Assets" items={[
                                { id: 1, text: "New", link: "/assets/new" }
                            ]} />

                            <DropDownMenu head_link="/loans" head_text="Loans" items={[
                                { id: 1, text: "New", link: "/loans/new" },
                                { id: 2, text: "Return", link: "/loans/return" }
                            ]} />

                            <DropDownMenu head_link="kit-tracking" head_text="Kit Tracking" items={[
                                { id: 1, text: "New", link: "/kit-tracking/new" }
                            ]} />

                            
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
                onClick={() => closeMenu()} 
                aria-label="Close menu"
                className="mb-6 text-xl font-bold focus:outline-none"
                >
                ✕ Close
                </button>
                <nav className="flex flex-col space-y-4 text-lg">
                
                    {/* Assets */}

                    <OffCanvasDropDownMenu id="assets" head_text="Assets" items={[
                        { id: 1, text: "List", link: "/assets" },
                        { id: 2, text: "New", link: "/assets/new" }
                    ]} />

                    <OffCanvasDropDownMenu id="loans" head_text="Loans" items={[
                        { id: 1, text: "List", link: "/loans" },
                        { id: 2, text: "New", link: "/loans/new" },
                        { id: 3, text: "Return", link: "/loans/return" }
                    ]} />

                    <OffCanvasDropDownMenu id="kit-tracking" head_text="Kit Tracking" items={[
                        { id: 1, text: "List", link: "/kit-tracking" },
                        { id: 2, text: "New", link: "/kit-tracking/new" }
                    ]} />
                    
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