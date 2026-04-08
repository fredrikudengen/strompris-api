import {useEffect, useState} from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Label } from 'recharts'

function DayChart({ date: initialDate, region: initialRegion, children }) {
    const today = new Date().toISOString().split('T')[0]
    const [date, setDate] = useState(initialDate ?? today)
    const [region, setRegion] = useState(initialRegion ?? 'NO1')
    const [prices, setPrices] = useState(null)
    const [hasTomorrow, setHasTomorrow] = useState(false)

    const changeDay = (offset) => {
        const current = new Date(date)
        current.setDate(current.getDate() + offset)
        setDate(current.toISOString().split('T')[0])
    }

    useEffect(() => {
        const fetchPrices = async () => {
            const response = await fetch(`http://localhost:8000/prices/date?date=${date}&region=${region}`)
            const data = await response.json()
            setPrices(data)
        }
        setPrices(null)
        fetchPrices()
    }, [date, region])

    useEffect(() => {
        const checkTomorrow = async () => {
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowStr = tomorrow.toISOString().split('T')[0]
            const response = await fetch(`http://localhost:8000/prices/date?date=${tomorrowStr}&region=${region}`)
            const data = await response.json()
            setHasTomorrow(data.prices && data.prices.length > 0)
        }
        checkTomorrow()
    }, [region])

    if (!prices) return <p>Laster...</p>

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    return (
        <div className="flex flex-col items-center py-5">
            <h1 className="text-xl font-semibold text-black">Dagsvisning</h1>
            <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-2 py-1 mb-2 rounded-lg bg-white border-2 border-black text-black font-medium"
            >
                <option value="NO1">NO1</option>
                <option value="NO2">NO2</option>
                <option value="NO3">NO3</option>
                <option value="NO4">NO4</option>
                <option value="NO5">NO5</option>
            </select>
            <LineChart width={800} height={400} data={prices.prices} margin={{ top: 20, right: 30, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="black" tick={{ fill: 'black' }}>
                    <Label value="Time" offset={-10} position="insideBottom" style={{ fill: 'black' }} />
                </XAxis>
                <YAxis stroke="black" tick={{ fill: 'black' }}>
                    <Label value="kr/kWh" angle={-90} position="outsideLeft" offset={-100} style={{ fill: 'black' }} />
                </YAxis>
                <Tooltip />
                <Line dataKey="price_nok" stroke="#facc15" strokeWidth={2} dot={false} />
                {children}
            </LineChart>
            <div className="flex items-center gap-4 mt-0 ml-11">
                <button
                    onClick={() => changeDay(-1)}
                    className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                    ← I går
                </button>
                <button
                    onClick={() => setDate(today)}
                    className="px-3 py-1 rounded-lg bg-white border-2 border-black text-black font-medium hover:bg-gray-100"
                >
                    I dag
                </button>
                <button
                    onClick={() => changeDay(1)}
                    disabled={date >= tomorrowStr || !hasTomorrow}
                    className={`px-3 py-1 rounded-lg text-white font-medium
                        ${date >= tomorrowStr || !hasTomorrow
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'}`}
                >
                    I morgen →
                </button>
            </div>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-4 ml-4 px-3 py-1 rounded-lg border-2 border-green-600 text-gray-700"
            />
            <div className="max-w-2xl mt-24 text-left px-0">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hva betyr strømpris?</h2>
            <p className="text-gray-600 mb-8">
                Strømprisen i Norge settes time for time i det nordiske kraftmarkedet Nord Pool.
                Prisen påvirkes av tilbud og etterspørsel, så når det er mye vann i magasinene og lav etterspørsel så
                er prisen lav. Når det er kaldt, lite vind eller lite nedbør, stiger prisen.
            </p>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hva betyr regionene?</h2>
            <p className="text-gray-600 mb-4">Norge er delt inn i fem prisområder:</p>
            <ul className="text-gray-600 space-y-3 list-none">
                <li><span className="font-medium text-green-700">NO1 — Østlandet:</span> Oslo og omkringliggende fylker</li>
                <li><span className="font-medium text-green-700">NO2 — Sørlandet:</span> Agder og Rogaland</li>
                <li><span className="font-medium text-green-700">NO3 — Midt-Norge:</span> Trøndelag og Møre og Romsdal</li>
                <li><span className="font-medium text-green-700">NO4 — Nord-Norge:</span> Nordland, Troms og Finnmark</li>
                <li><span className="font-medium text-green-700">NO5 — Vestlandet:</span> Bergen og omegn</li>
            </ul>
            <p className="text-gray-600 mt-4">
                Prisforskjellene mellom regionene skyldes kapasiteten på strømnettet mellom dem.
                Hvis det ikke er nok kapasitet til å overføre strøm fra et område med overskudd til et med underskudd,
                vil prisene skille seg fra hverandre.
            </p>
        </div>
        </div>
    )
}

export default DayChart