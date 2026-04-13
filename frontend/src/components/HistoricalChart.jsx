import {useEffect, useState} from "react";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Label, ReferenceDot} from 'recharts'
import API_URL from "../api.js";

function HistoricalChart() {
    const [period, setPeriod] = useState(null)
    const [region, setRegion] = useState('NO5')

    useEffect(() => {
        const fetchPeriod = async () => {
            const response = await fetch(`${API_URL}/prices/monthly?region=${region}`)
            const data = await response.json()
            setPeriod(data)
        }
        fetchPeriod()
    }, [region])

    if (!period) return <p>Laster...</p>

    const flatPrices = []
    for (const month of period) {
        const date = new Date(month.month)
        const label = date.toLocaleDateString('no-NO', {year: 'numeric', month: 'short'})
        flatPrices.push({ month: label, price_nok: month.price_nok })
    }


    const events = [
        { month: 'nov. 2021', label: 'Energikrise starter' },
        { month: 'feb. 2022', label: 'Krigen i Ukraina' },
        { month: 'sep. 2022', label: 'Rekordpriser' },
    ]

    return (
        <div className="flex flex-col items-center py-8">
            <h1>Historisk visning</h1>
            <h2 className="text-gray-500 font-normal mb-4">Strømpriser fra oktober 2021 til i dag</h2>
            <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-3 py-1 rounded-lg bg-white border-2 border-black text-black font-medium mb-4"
            >
                <option value="NO1">NO1</option>
                <option value="NO2">NO2</option>
                <option value="NO3">NO3</option>
                <option value="NO4">NO4</option>
                <option value="NO5">NO5</option>
            </select>
            <LineChart width={800} height={400} data={flatPrices} margin={{ top: 20, right: 30, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="black" tick={{ fill: 'black' }}>
                </XAxis>
                <YAxis stroke="black" tick={{ fill: 'black' }}>
                    <Label value="kr/kWh" angle={-90} position="outsideLeft" offset={-100} style={{ fill: 'black' }} />
                </YAxis>
                <Tooltip formatter={(value) => [`${value.toFixed(2)} kr/kWh`, 'Pris']} labelFormatter={(label) => `Time: ${label}`} />
                <Line dataKey="price_nok" stroke="#facc15" strokeWidth={2} dot={false} />
                {events.map((event) => {
                    const matchingPrice = flatPrices.find((p) => p.month === event.month)
                    return (
                        <ReferenceDot key={event.month} x={event.month} y={matchingPrice?.price_nok} r={6} fill="red" />
                    )
                })}
            </LineChart>
            <div className="flex gap-8 mt-2">
                {events.map((event) => (
                    <div key={event.month} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-600">{event.month} — {event.label}</span>
                    </div>
                ))}
            </div>
            <div className="max-w-2xl mt-12 text-left px-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Hva viser grafen?</h2>
                <p className="text-gray-600 mb-6">
                    Grafen viser månedlige gjennomsnittspriser for strøm i den valgte regionen.
                    Du kan tydelig se hvordan prisene steg dramatisk høsten 2021 da Europa opplevde en stor energikrise.
                </p>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Hvorfor var prisene så høye?</h2>
                <p className="text-gray-600 mb-6">
                    Høsten 2021 kombinerte flere faktorer til en storm: lite nedbør ga lave vannmagasiner,
                    gasslagrene i Europa var nesten tomme, og etterspørselen etter energi økte etter pandemien.
                    Da Russland invaderte Ukraina i februar 2022 forverret situasjonen seg ytterligere,
                    og Norge nådde rekordpriser sommeren 2022.
                </p>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Hvor får vi tallene fra?</h2>
                <p className="text-gray-600 mb-6">
                    Tallene er hentet fra hvakosterstrommen.no sitt API. De publiserer tall for morgendagen og
                    har data tilbake til oktober 2021. Ønsker du å se eldre tall kan du besøke{" "}
                    <a
                        href="https://minspotpris.no/historiskepriser/vis-historiske-str%C3%B8mpriser.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 underline hover:text-green-900">
                        minspotpris.no
                    </a>
                </p>
            </div>
        </div>
    )
}

export default HistoricalChart