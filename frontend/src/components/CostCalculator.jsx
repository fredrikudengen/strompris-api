import {useEffect, useState} from "react";
import {ReferenceLine} from "recharts";
import DayChart from "./DayChart.jsx";
import API_URL from "../api.js";

function CostCalculator() {
    const today = new Date().toISOString().split('T')[0]
    const [date, setDate] = useState(today)
    const [apparat, setApparat] = useState('Vaskemaskin')
    const [kW, setKW] = useState(2)
    const [minutes, setMinutes] = useState(90)
    const [kWh, setKWh] = useState(0.8)
    const [expensive, setExpensive] = useState(null)
    const [cheapest, setCheapest] = useState(null)
    const [region, setRegion] = useState('NO1')

    const apparater = {
        'Vaskemaskin': { kW: 2, minutes: 90, kWh: 0.8 },
        'Dusj':        { kW: 7, minutes: 10, kWh: 6.0 },
        'Stekeovn':    { kW: 2.5, minutes: 35, kWh: 1.5 },
        'Elbil':       { kW: 50, minutes: 60, kWh: 70 },
    }

    useEffect(() => {
        const fetchCheapest = async () => {
            const response = await fetch(`${API_URL}/prices/cheapest-date?date=${date}&region=${region}`)
            const data = await response.json()
            setCheapest(data)
        }
        fetchCheapest()
    }, [date, region])

    useEffect(() => {
        const fetchExpensive = async () => {
            const response = await fetch(`${API_URL}/prices/most-expensive-date?date=${date}&region=${region}`)
            const data = await response.json()
            setExpensive(data)
        }
        fetchExpensive()
    }, [date, region])

    if (!expensive || !cheapest) return <p>Laster...</p>

    const kostnad = (pris) => (kWh * pris).toFixed(2)

    return (
        <div className="flex flex-col items-center py-8">
            <h1>Kostnadskalkulator</h1>
            <p className="text-gray-500 mb-8 max-w-xl">
                Velg et apparat eller skriv inn egne verdier for å se hva det koster å bruke strøm på billigste og dyreste tidspunkt.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-6">
                <select
                    value={apparat}
                    onChange={(e) => {
                        const valgt = e.target.value
                        setApparat(valgt)
                        setKW(apparater[valgt].kW)
                        setMinutes(apparater[valgt].minutes)
                        setKWh(apparater[valgt].kWh)
                    }}
                    className="px-3 py-1 rounded-lg bg-white border-2 border-black text-black font-medium"
                >
                    <option value="Vaskemaskin">Vaskemaskin</option>
                    <option value="Dusj">Dusj</option>
                    <option value="Stekeovn">Stekeovn</option>
                    <option value="Elbil">Elbil (hurtiglader)</option>
                </select>

                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="px-3 py-1 rounded-lg bg-white border-2 border-black text-black font-medium"
                >
                    <option value="NO1">NO1</option>
                    <option value="NO2">NO2</option>
                    <option value="NO3">NO3</option>
                    <option value="NO4">NO4</option>
                    <option value="NO5">NO5</option>
                </select>

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3 py-1 rounded-lg border-2 border-green-600 text-gray-700"
                />
            </div>

            <div className="flex gap-4 justify-center mb-6">
                <div className="flex items-center gap-2">
                    <label className="text-gray-600 text-sm">Effekt (kW):</label>
                    <input
                        type="number"
                        value={kW}
                        onChange={(e) => {
                            setKW(e.target.value)
                            setKWh(e.target.value * (minutes / 60))
                        }}
                        className="w-20 px-3 py-1 rounded-lg border-2 border-green-600 text-gray-700"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-gray-600 text-sm">Minutter:</label>
                    <input
                        type="number"
                        value={minutes}
                        onChange={(e) => {
                            setMinutes(e.target.value)
                            setKWh(kW * (e.target.value / 60))
                        }}
                        className="w-20 px-3 py-1 rounded-lg border-2 border-green-600 text-gray-700"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-gray-600 text-sm">Forbruk (kWh):</label>
                    <input
                        type="number"
                        value={kWh}
                        onChange={(e) => setKWh(e.target.value)}
                        className="w-20 px-3 py-1 rounded-lg border-2 border-green-600 text-gray-700"
                    />
                </div>
            </div>

            <div className="flex gap-8 mb-8">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl px-6 py-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Billigste time</p>
                    <p className="text-2xl font-semibold text-green-700">kl. {cheapest.hour}:00</p>
                    <p className="text-lg text-green-600">{kostnad(cheapest.price_nok)} kr</p>
                </div>
                <div className="bg-red-50 border-2 border-red-400 rounded-xl px-6 py-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Dyreste time</p>
                    <p className="text-2xl font-semibold text-red-700">kl. {expensive.hour}:00</p>
                    <p className="text-lg text-red-600">{kostnad(expensive.price_nok)} kr</p>
                </div>
            </div>
            <div className="max-w-2xl mt-12 text-left px-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Slik bruker du kalkulatoren</h2>
                <p className="text-gray-600 mb-6">
                    Velg et apparat fra listen, eller skriv inn egne verdier for effekt (kW), tid (minutter) og forbruk (kWh).
                    Kalkulatoren viser hva det koster å bruke apparatet i den billigste og dyreste timen på valgt dato.
                    Du kan spare penger ved å flytte strømforbruket til billige timer, spesielt om natten.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mb-4">Slik har vi regnet ut standardverdiene</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-600 border-collapse">
                        <thead>
                            <tr className="bg-green-50 text-gray-700">
                                <th className="text-left px-4 py-2 border border-gray-200">Apparat</th>
                                <th className="text-left px-4 py-2 border border-gray-200">Tid</th>
                                <th className="text-left px-4 py-2 border border-gray-200">Effekt</th>
                                <th className="text-left px-4 py-2 border border-gray-200">Forbruk</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-4 py-2 border border-gray-200 font-medium">Dusj</td>
                                <td className="px-4 py-2 border border-gray-200">~10 min</td>
                                <td className="px-4 py-2 border border-gray-200">7 kW</td>
                                <td className="px-4 py-2 border border-gray-200">~6 kWh</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="px-4 py-2 border border-gray-200 font-medium">Vaskemaskin</td>
                                <td className="px-4 py-2 border border-gray-200">~90 min</td>
                                <td className="px-4 py-2 border border-gray-200">2 kW (snitt)</td>
                                <td className="px-4 py-2 border border-gray-200">~0,8 kWh</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border border-gray-200 font-medium">Stekeovn (pizza)</td>
                                <td className="px-4 py-2 border border-gray-200">~35 min</td>
                                <td className="px-4 py-2 border border-gray-200">2,5 kW</td>
                                <td className="px-4 py-2 border border-gray-200">~1,5 kWh</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="px-4 py-2 border border-gray-200 font-medium">Elbil (hurtiglader)</td>
                                <td className="px-4 py-2 border border-gray-200">30–60 min</td>
                                <td className="px-4 py-2 border border-gray-200">50–150 kW</td>
                                <td className="px-4 py-2 border border-gray-200">~60–80 kWh</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-gray-500 text-sm mt-4">
                    Merk: Forbruket varierer avhengig av modell, alder og innstillinger. Tallene er basert på typiske gjennomsnittsverdier.
                </p>
            </div>
            <DayChart date={date} region={region}>
                <ReferenceLine x={cheapest.hour} stroke="green" label="Billigst" />
                <ReferenceLine x={expensive.hour} stroke="red" label="Dyrest" />
            </DayChart>
        </div>
    )
}

export default CostCalculator