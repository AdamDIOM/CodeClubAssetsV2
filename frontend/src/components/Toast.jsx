import { useEffect, useState } from "react";

export default function Toast({ message, onClose, duration = 3000, close = false }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (message) {
        setIsVisible(true);

        // Auto-dismiss after given duration
        const timer = setTimeout(() => handleClose(), duration);
        return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if(close){
            handleClose()
        }
    }, [close]);

    const handleClose = () => {
        setIsExiting(true);
        // Wait for fade-out animation (300 ms)
        setTimeout(() => {
            setIsVisible(false);
            setIsExiting(false);
            onClose?.();
        }, 300);
    };
    if (!isVisible) return null;

    return (
        <div className={`bg-club-green-300/50 dark:bg-club-orange-800/50 sm:max-w-sm sm:w-auto w-8/10 rounded-xl px-4 py-3 fixed bottom-6 sm:right-5 right-1/10 z-50 flex items-center gap-3 shadow-md dark:shadow-neutral-600 justify-between ${isExiting ? "animate-fade-out" : "animate-slide-up"}`}>
                
            <p className="mx-5">{message}</p>
            <button aria-label="Close popup"
            className="text-xl font-bold focus:outline-none "
        onClick={handleClose}> ✕ </button>
        </div>
    )
}