"use client";

import { useEffect, useState } from "react";

export default function InterviewPage({ params }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const interviewId = params.id;

  // 🔊 Speak AI question
  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
  };

  // 🎤 Speech to text
  const startListening = () => {
    const recognition =
      new (window as any).webkitSpeechRecognition();

    recognition.onresult = (event: any) => {
      setAnswer(event.results[0][0].transcript);
    };

    recognition.start();
  };

  // 📩 Submit Answer
  const submitAnswer = async () => {
    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/interview/answer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId,
          answer,
        }),
      }
    );

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: answer },
      { role: "ai", text: data.feedback },
    ]);

    setAnswer("");

    if (!data.isCompleted) {
      setQuestion(data.nextQuestion);
      speak(data.nextQuestion);
    } else {
      setQuestion("Interview Completed 🎉");
    }

    setLoading(false);
  };

  useEffect(() => {
    // load first question
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}`)
      .then((res) => res.json())
      .then((data) => {
        const q = data.questions[0];
        setQuestion(q);
        speak(q);
      });
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">AI Interview</h2>

      <div className="border p-4 h-80 overflow-y-auto mb-4">
        <p className="text-blue-600">AI: {question}</p>

        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.role}:</b> {m.text}
          </p>
        ))}
      </div>

      <textarea
        className="w-full border p-2"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer..."
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={startListening}
          className="bg-gray-500 text-white px-3 py-1"
        >
          🎤 Speak
        </button>

        <button
          onClick={submitAnswer}
          className="bg-blue-600 text-white px-3 py-1"
        >
          Submit
        </button>
      </div>

      {loading && <p>Processing...</p>}
    </div>
  );
}