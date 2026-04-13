import {useState} from "react";
import ReactMarkdown from 'react-markdown'
import API_URL from "../api.js";

const spørsmål = [
    {
        id: 1,
        spørsmål: "Hvor kommer norsk strøm fra?",
        svar: null
    },
    {
        id: 2,
        spørsmål: "Hvem kjøper norsk strøm?",
        svar: null
    },
    {
        id: 3,
        spørsmål: "Hvorfor varierer strømprisen?",
        svar: null
    },
]

function LearnMore() {
    const [åpentId, setÅpentId] = useState(null)
    const [svar, setSvar] = useState({})
    const [laster, setLaster] = useState({})
    const [fritekst, setFritekst] = useState('')
    const [fritekstSvar, setFritekstSvar] = useState(null)
    const [fritekstLaster, setFritekstLaster] = useState(false)
    const [region, setRegion] = useState('NO1')

    const hentSvar = async (spørsmålTekst, id) => {
        if (svar[id]) return
        setLaster(prev => ({ ...prev, [id]: true }))
        try {
            const response = await fetch(`${API_URL}/claude/ask?question=${encodeURIComponent(spørsmålTekst)}&region=${region}`)
            if (!response.ok) {
                const error = await response.json()
                setSvar(prev => ({ ...prev, [id]: error.detail }))
            } else {
                const data = await response.json()
                setSvar(prev => ({ ...prev, [id]: data }))
            }
        } catch {
            setSvar(prev => ({ ...prev, [id]: "Noe gikk galt, prøv igjen." }))
        }
        setLaster(prev => ({ ...prev, [id]: false }))
    }

    const spørClaude = async () => {
        if (!fritekst.trim()) return
        setFritekstLaster(true)
        setFritekstSvar(null)
        try {
            const response = await fetch(`${API_URL}/claude/ask?question=${encodeURIComponent(fritekst)}&region=${region}`)
            if (!response.ok) {
                const error = await response.json()
                setFritekstSvar(error.detail)
            } else {
                const data = await response.json()
                setFritekstSvar(data)
            }
        } catch {
            setFritekstSvar("Noe gikk galt. Anthropic API-et kan være overbelastet. Prøv igjen senere.")
        }
        setFritekstLaster(false)
    }

    const toggleSpørsmål = (id, tekst) => {
        if (åpentId === id) {
            setÅpentId(null)
        } else {
            setÅpentId(id)
            hentSvar(tekst, id)
        }
    }

    return (
        <div className="flex flex-col items-center py-8">
            <h1>Lær mer om norsk strøm</h1>
            <p className="text-gray-500 mb-8 max-w-xl">
                Trykk på et spørsmål for å lese svaret, eller still ditt eget spørsmål til Claude nederst på siden.
            </p>

            <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-3 py-1 rounded-lg bg-white border-2 border-black text-black font-medium mb-8"
            >
                <option value="NO1">NO1</option>
                <option value="NO2">NO2</option>
                <option value="NO3">NO3</option>
                <option value="NO4">NO4</option>
                <option value="NO5">NO5</option>
            </select>

            <div className="w-full max-w-2xl px-6">
                {spørsmål.map((s) => (
                    <div key={s.id} className="mb-3 border-2 border-gray-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => toggleSpørsmål(s.id, s.spørsmål)}
                            className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-green-50 font-medium text-gray-800"
                        >
                            {s.spørsmål}
                            <span className="text-green-600 text-xl">
                                {åpentId === s.id ? '−' : '+'}
                            </span>
                        </button>
                        {åpentId === s.id && (
                            <div className="px-6 py-4 bg-gray-50 text-gray-600 text-left">
                                {laster[s.id] ? (
                                    <p className="text-gray-400 italic">Claude tenker...</p>
                                ) : (
                                    <ReactMarkdown>{svar[s.id]}</ReactMarkdown>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Still ditt eget spørsmål</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={fritekst}
                            onChange={(e) => setFritekst(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && spørClaude()}
                            placeholder="Spør Claude om norsk strøm..."
                            className="flex-1 px-4 py-2 rounded-lg border-2 border-green-600 text-gray-700"
                        />
                        <button
                            onClick={spørClaude}
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
                        >
                            Send
                        </button>
                    </div>
                    {fritekstLaster && <p className="text-gray-400 italic mt-4">Claude tenker...</p>}
                    {fritekstSvar && (
                        <div className="mt-4 text-left text-gray-600 bg-gray-50 rounded-xl px-6 py-4 border-2 border-gray-200">
                            <ReactMarkdown>{fritekstSvar}</ReactMarkdown>
                        </div>
                    )}
                </div>

                <div className="mt-12 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Videre ressurser:</h2>
                    <ul className="space-y-3">
                        <li>
                            <a href="https://www.nve.no/energi/energisystem/kraftproduksjon/" target="_blank" rel="noreferrer"
                                className="text-green-700 hover:underline">
                                NVE — Kraftproduksjon i Norge
                            </a>
                        </li>
                        <li>
                            <a href="https://www.regjeringen.no/no/tema/energi/id212/" target="_blank" rel="noreferrer"
                                className="text-green-700 hover:underline">
                                Regjeringen — Energipolitikk
                            </a>
                        </li>
                        <li>
                            <a href="https://www.statnett.no/" target="_blank" rel="noreferrer"
                                className="text-green-700 hover:underline">
                                Statnett — Kraftmarkedet
                            </a>
                        </li>
                        <li>
                            <a href="https://www.nordpoolgroup.com/" target="_blank" rel="noreferrer"
                                className="text-green-700 hover:underline">
                                Nord Pool — Det nordiske kraftmarkedet
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default LearnMore