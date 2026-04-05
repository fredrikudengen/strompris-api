import {useEffect, useState} from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'

function HistoricalChart() {
    const [period, setPeriod] = useState(null)
    const [region, setRegion] = useState('NO5')

    useEffect(() => {
        const fetchPeriod = async () => {
            const response = await fetch(`http://localhost:8000/prices/monthly?region=${region}`)
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
        flatPrices.push({
            month: label,
            price_nok: month.price_nok
        })
    }

    const events = [
    { month: 'nov. 2021', label: 'Energikrise starter' },
    { month: 'feb. 2022', label: 'Krigen i Ukraina' },
    { month: 'aug. 2022', label: 'Rekordpriser' },
    ]

    return (
    <div>
      <h1>Historisk visning</h1>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="NO1">NO1</option>
                <option value="NO2">NO2</option>
                <option value="NO3">NO3</option>
                <option value="NO4">NO4</option>
                <option value="NO5">NO5</option>
        </select>
        <p>
            <LineChart width={800} height={400} data={flatPrices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line dataKey="price_nok" />
                {events.map((event) => (<ReferenceLine x={event.month} stroke="red" label={event.label} />
                ))}
            </LineChart>
        </p>
    </div>
  )
}
export default HistoricalChart