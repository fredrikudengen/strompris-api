import {useEffect, useState} from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

function DayChart() {
    const [prices, setPrices] = useState(null)
    const [day, setDay] = useState('2026-04-05')
    const [region, setRegion] = useState('NO5')

    useEffect(() => {
        const fetchPrices = async () => {
            const response = await fetch(`http://localhost:8000/prices/date?date=${day}&region=${region}`)
            const data = await response.json()
            setPrices(data)
        }
        setPrices(null)
        fetchPrices()
    }, [day, region])
    if (!prices) return <p>Laster...</p>
  return (
    <div>
      <h1>Dagvisning</h1>
        <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
        />
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="NO1">NO1</option>
                <option value="NO2">NO2</option>
                <option value="NO3">NO3</option>
                <option value="NO4">NO4</option>
                <option value="NO5">NO5</option>
        </select>
        <div>
            <LineChart width={800} height={400} data={prices.prices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line dataKey="price_nok" />
            </LineChart>
        </div>
    </div>
  )
}
export default DayChart