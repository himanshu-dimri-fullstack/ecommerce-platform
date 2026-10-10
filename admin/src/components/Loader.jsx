const Loader = () => {
    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] flex items-center justify-center">
            <div className="relative flex items-center justify-center">

                {/* Outer Glow */}
                <div className="absolute w-24 h-24 rounded-full bg-emerald-400/20 blur-2xl animate-pulse" />

                {/* Spinner */}
                <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin" />

                {/* Center Dot */}
                <div className="absolute w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50" />
            </div>
        </div>
    );
};

export default Loader;