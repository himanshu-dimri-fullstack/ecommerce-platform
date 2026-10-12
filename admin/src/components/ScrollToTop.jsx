
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiArrowUp } from "react-icons/fi";

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { pathname } = useLocation();

    // Automatically scroll to top when route changes
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });

        setIsVisible(false);
    }, [pathname]);

    // Show button when page is scrolled
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Manually scroll to top on button click
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Scroll to top"
            className={`
                fixed bottom-6 right-6 z-50
                flex h-12 w-12 items-center justify-center
                rounded-full bg-[#003963] text-white
                shadow-lg shadow-blue-900/20
                transition-all duration-300
                hover:-translate-y-1 hover:bg-[#00518a]
                focus:outline-none focus:ring-4
                focus:ring-blue-300
                ${isVisible
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-4 opacity-0"
                }
            `}
        >
            <FiArrowUp size={22} />
        </button>
    );
};

export default ScrollToTop;
