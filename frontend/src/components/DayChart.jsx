import {useEffect, useState} from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

function DayChart({ date, region, children }) {
    const [prices, setPrices] = useState(null)

    useEffect(() => {
        const fetchPrices = async () => {
            const response = await fetch(`http://localhost:8000/prices/date?date=${date}&region=${region}`)
            const data = await response.json()
            setPrices(data)
        }
        setPrices(null)
        fetchPrices()
    }, [date, region])
    if (!prices) return <p>Laster...</p>
  return (
    <div>
      <h1>Dagvisning</h1>
        <div>
            <LineChart width={800} height={400} data={prices.prices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line dataKey="price_nok" />
                {children}
            </LineChart>
        </div>
    </div>
  )
}
export default DayChart