import API_URL from '../api.js'
import {useEffect, useState} from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Label } from 'recharts'

function AverageChart() {
    const [period, setPeriod] = useState(null)
    const [average, setAverage] = useState(null)
    const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0])
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])
    const [region, setRegion] = useState('NO5')

    useEffect(() => {
        const fetchPeriod = async () => {
            const response = await fetch(`${API_URL}/prices/period?from_date=${fromDate}&to_date=${toDate}&region=${region}`)
            const data = await response.json()
            setPeriod(data)
        }
        fetchPeriod()
    }, [fromDate, toDate, region])

    useEffect(() => {
        const fetchAverage = async () => {
            if (fromDate === toDate) {
                const response = await fetch(`${API_URL}/prices/average-date?date=${fromDate}&region=${region}`)
                const data = await response.json()
                setAverage(data)
            }
            else {
                const response = await fetch(`${API_URL}/prices/average?from_date=${fromDate}&to_date=${toDate}&region=${region}`)
                const data = await response.json()
                setAverage(data)
            }
        }
        fetchAverage()
    }, [fromDate, toDate, region])

    if (!period) return <p>Laster...</p>

    const flatPrices = []
    for (const day of period) {
        for (const price of day.prices) {
            flatPrices.push({
                date: day.date,
                hour: price.hour,
                price_nok: price.price_nok
            })
        }
    }

    return (
        <div className="flex flex-col items-center py-8">
            <h1>Gjennomsnitt</h1>
            <div className="flex gap-4 mb-6 mt-6 items-center">
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-3 py-1 rounded-lg border-2 border-green-600 text-gray-700"
                />
                <span className="text-gray-500">til</span>
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-1 rounded-lg border-2 border-green-600 text-gray-700"
                />
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
            </div>
            <LineChart width={800} height={400} data={flatPrices} margin={{ top: 20, right: 30, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                {fromDate === toDate ?
                    <XAxis dataKey="hour" stroke="black" tick={{ fill: 'black' }}>
                        <Label value="Time" offset={-10} position="insideBottom" style={{ fill: 'black' }} />
                    </XAxis>
                :
                    <XAxis dataKey="date" stroke="black" tick={{ fill: 'black' }}>
                        <Label value="Dato" offset={-10} position="insideBottom" style={{ fill: 'black' }} />
                    </XAxis>
                }
                <YAxis stroke="black" tick={{ fill: 'black' }}>
                    <Label value="kr/kWh" angle={-90} position="outsideLeft" offset={-100} style={{ fill: 'black' }} />
                </YAxis>
                <Tooltip formatter={(value) => [`${value.toFixed(2)} kr/kWh`, 'Pris']} labelFormatter={(label) => `Time: ${label}`} />
                <Line dataKey="price_nok" stroke="#facc15" strokeWidth={2} dot={false} />
                <ReferenceLine y={average} stroke="red" strokeDasharray="5 5" label={{ value: `Snitt: ${average?.toFixed(2)} kr`, fill: 'red', position: 'insideTopRight' }} />
            </LineChart>
            <div className="max-w-2xl mt-12 text-left px-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Hva viser grafen?</h2>
                <p className="text-gray-600 mb-6">
                    Grafen viser timepriser for strøm i den valgte perioden. Den røde stiplete linjen viser
                    gjennomsnittet for hele perioden. Her kan du se hvilke timer og dager
                    som er dyrere eller billigere enn normalt.
                </p>
                <p className="text-gray-600 mb-6">
                    Velg en kortere periode for å se tydelige daglige mønstre, eller en lengre periode
                    for å se sesongvariasjoner. Prisen er typisk lavest om natten og høyest om morgenen
                    og ettermiddagen når folk er hjemme.
                </p>
            </div>
        </div>
    )
}

export default AverageChart