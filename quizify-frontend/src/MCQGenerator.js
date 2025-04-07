import React, { useState } from 'react';

export default function MCQGenerator() {
  const [text, setText] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [mcq, setMcq] = useState(null);

  const handleGenerate = () => {
    setMcq({
      question: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin', 'Madrid'],
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded space-y-4">
      <h1 className="text-2xl font-bold text-center">Automatic MCQ Generator</h1>

      <textarea
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring"
        placeholder="Enter your text here"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div>
        <label className="block mb-1 font-medium">Difficulty:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full bg-black text-white py-2 rounded hover:opacity-90"
      >
        Generate MCQ
      </button>

      {mcq && (
        <div className="mt-6">
          <p className="font-medium">Q: {mcq.question}</p>
          <ul className="mt-2 space-y-1">
            {mcq.options.map((opt, idx) => (
              <li key={idx}>
                {String.fromCharCode(65 + idx)}: {opt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
