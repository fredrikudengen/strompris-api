import {useEffect, useState} from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

function DayChart() {
    const [prices, setPrices] = useState(null)

    useEffect(() => {
        const fetchPrices = async () => {
            const response = await fetch('http://localhost:8000/prices/day')
            const data = await response.json()
            setPrices(data)
        }
        fetchPrices()
    }, [])
    if (!prices) return <p>Laster...</p>
  return (
    <div>
      <h1>Dagvisning</h1>
        <p>
            <LineChart width={800} height={400} data={prices.prices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line dataKey="price_nok" />
            </LineChart>
        </p>
    </div>
  )
}
export default DayChart