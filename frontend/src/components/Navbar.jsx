import {useState} from "react";

function Navbar({ onNavigate, activePage }) {
    const [isOpen, setIsOpen] = useState(false)
    const pages = [
        { key: 'day', label: 'Dagsvisning' },
        { key: 'history', label: 'Historisk graf' },
        { key: 'avg', label: 'Gjennomsnittspris' },
        { key: 'calc', label: 'Kostnadskalkulator' },
        { key: 'learn', label: 'Lær mer' },
    ]
    return (
        <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-200 relative bg-green-600">
            <span className="font-semibold text-2xl text-white">Strømpris</span>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white font-medium"
            >
                Meny
            </button>
            {isOpen && (
                <div className="absolute right-6 top-14 bg-white border border-gray-200 rounded-lg shadow-lg z-10 flex flex-col">
                    {pages.map((page) => (
                        <button
                            key={page.key}
                            onClick={() => { onNavigate(page.key); setIsOpen(false) }}
                            className={`px-6 py-3 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg
                                ${activePage === page.key ? 'bg-green-50 text-green-600 font-medium' : ''}`}
                        >
                            {page.label}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    )
}

export default Navbar