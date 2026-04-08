import {useState} from "react";
import ReactMarkdown from 'react-markdown'

function LearnMore() {
    const [answer, setAnswer] = useState(null)
    const [question, setQuestion] = useState(null)
    const [region, setRegion] = useState("2026-04-04")
    const questions = [
        "Hvor kommer norsk strøm fra?",
        "Hvem kjøper norsk strøm?",
        "Hvorfor varierer strømprisen?",
        "Hva er pågående kraftprosjekter?"
    ]
    const askClaude = async (question) => {
        const response = await fetch(`http://localhost:8000/claude/ask?question=${encodeURIComponent(question)}&region=${region}`)
        const data = await response.json()
        setAnswer(data)
    }
    return (
        <div>
            <h1>Lær mer om norsk strøm</h1>
            {questions.map((question) => (
                <button onClick={() => askClaude(question)}>
                    {question}
                </button>
            ))}
            <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={() => askClaude(question)}>
                Send spørsmål
            </button>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="NO1">NO1</option>
                <option value="NO2">NO2</option>
                <option value="NO3">NO3</option>
                <option value="NO4">NO4</option>
                <option value="NO5">NO5</option>
            </select>
            {answer && <ReactMarkdown>{answer}</ReactMarkdown>}
        </div>
    )
}

export default LearnMore