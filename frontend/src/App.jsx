import DayChart from "./components/DayChart.jsx";
import AverageChart from "./components/AverageChart.jsx";
import HistoricalChart from "./components/HistoricalChart.jsx";
import CostCalculator from "./components/CostCalculator.jsx";
import LearnMore from "./components/LearnMore.jsx";

function App() {
  return (
    <div>
      <h1>Strømpris</h1>
        <HistoricalChart />
    </div>
  )
}

export default App