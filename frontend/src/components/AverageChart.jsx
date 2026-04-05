import {useEffect, useState} from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'

function AverageChart() {
    const [period, setPeriod] = useState(null)
    const [average, setAverage] = useState(null)
    const [fromDate, setFromDate] = useState('2026-04-05')
    const [toDate, setToDate] = useState('2026-04-05')
    const [region, setRegion] = useState('NO5')

    useEffect(() => {
        const fetchPeriod = async () => {
            const response = await fetch(`http://localhost:8000/prices/period?from_date=${fromDate}&to_date=${toDate}&region=${region}`)
            const data = await response.json()
            setPeriod(data)
        }
        fetchPeriod()
    }, [fromDate, toDate, region])
    useEffect(() => {
        const fetchAverage = async () => {
            const response = await fetch(`http://localhost:8000/prices/average?from_date=${fromDate}&to_date=${toDate}&region=${region}`)
            const data = await response.json()
            setAverage(data)
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
    <div>
      <h1>Gjennomsnitt</h1>
        <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
        />
        <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
        />
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
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line dataKey="price_nok" />
                <ReferenceLine y={average} stroke="red" label="Snitt" />
            </LineChart>
        </p>
    </div>
  )
}
export default AverageChart