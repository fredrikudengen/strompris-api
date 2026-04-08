import {useEffect, useState} from "react";
import {ReferenceLine} from "recharts";
import DayChart from "./DayChart.jsx";

function CostCalculator() {
    const [date, setDate] = useState('2026-04-05')
    const [apparat, setApparat] = useState('Vaskemaskin')
    const [kW, setKW] = useState(1)
    const [minutes, setMinutes] = useState(15)
    const [expensive, setExpensive] = useState(null)
    const [cheapest, setCheapest] = useState(null)
    const [region, setRegion] = useState('NO1')

    useEffect(() => {
        const fetchCheapest = async () => {
            const response = await fetch(`http://localhost:8000/prices/cheapest-date?date=${date}&region=${region}`)
            const data = await response.json()
            setCheapest(data)
        }
        fetchCheapest()
    }, [date, region])
    useEffect(() => {
        const fetchExpensive = async () => {
            const response = await fetch(`http://localhost:8000/prices/most-expensive-date?date=${date}&region=${region}`)
            const data = await response.json()
            setExpensive(data)
        }
        fetchExpensive()
    }, [date, region])
    const apparater = {
    'Vaskemaskin': { kW: 2, minutes: 90 },
    'Dusj': { kW: 3, minutes: 15 },
    'Stekeovn': { kW: 2, minutes: 15 },
    'Elbil': { kW: 7.4, minutes: 60 },
    }
    if (!expensive)
        return <p>Laster...</p>
    return (
    <div>
      <h1>Priskalkulator</h1>
        <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
        />
        <input
            type="number"
            value={kW}
            onChange={(e) => setKW(e.target.value)}
        />
        <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
        />
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="NO1">NO1</option>
                <option value="NO2">NO2</option>
                <option value="NO3">NO3</option>
                <option value="NO4">NO4</option>
                <option value="NO5">NO5</option>
        </select>
        <select value={apparat} onChange={(e) => {
            setApparat(e.target.value)
            setKW(apparater[e.target.value].kW)
            setMinutes(apparater[e.target.value].minutes)
            }}>
                <option value="Vaskemaskin">Vaskemaskin</option>
                <option value="Dusj">Dusj</option>
                <option value="Stekeovn">Stekeovn</option>
                <option value="Elbil">Elbil</option>
        </select>
        <div>Billigste time: kl. {cheapest.hour}:00 — {(kW * (minutes / 60) * cheapest.price_nok).toFixed(2)} kr</div>
        <div>Dyreste time: kl. {expensive.hour}:00 — {(kW * (minutes / 60) * expensive.price_nok).toFixed(2)} kr</div>

        <DayChart date={date} region={region}>
            <ReferenceLine x={cheapest.hour} stroke="green" label="Billigst" />
            <ReferenceLine x={expensive.hour} stroke="red" label="Dyrest" />
        </DayChart>
    </div>
  )
}
export default CostCalculator