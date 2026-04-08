import {useState} from "react";

function LearnMore() {
    const [answer, setAnswer] = useState(null)

    const questions = [
        "Hvor kommer norsk strøm fra?",
        "Hvem kjøper norsk strøm?",
        "Hvorfor varierer strømprisen?",
        "Hva er pågående kraftprosjekter?"
    ]
    const askClaude = async (question) => {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1000,
                messages: [{ role: "user", content: question }]
            })
        })
        const data = await response.json()
        setAnswer(data.content[0].text)
    }

    return (
        <div>
            <h1>Lær mer om norsk strøm</h1>
            {questions.map((question) => (
                <button onClick={() => askClaude(question)}>
                    {question}
                </button>
            ))}
            {answer && <p>{answer}</p>}
        </div>
    )
}

export default LearnMore