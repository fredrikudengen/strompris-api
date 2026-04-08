import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import DayChart from './components/DayChart.jsx'
import HistoricalChart from "./components/HistoricalChart.jsx";
import AverageChart from "./components/AverageChart.jsx";
import CostCalculator from "./components/CostCalculator.jsx";
import LearnMore from "./components/LearnMore.jsx";

function App() {
  const [activePage, setActivePage] = useState('day')

  const date = new Date().toISOString().split('T')[0]

  return (
    <div>
      <Navbar onNavigate={setActivePage} activePage={activePage} />
      {activePage === 'day' && <DayChart date={date} />}
      {activePage === 'history' && <HistoricalChart />}
      {activePage === 'avg' && <AverageChart />}
      {activePage === 'calc' && <CostCalculator />}
      {activePage === 'learn' && <LearnMore />}
    </div>
  )
}

export default App