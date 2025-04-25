import React, { useState } from 'react';

export default function MCQGenerator() {
  const [text, setText] = useState('');
  const [mcq, setMcq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text.');
      return;
    }
    setLoading(true);
    setError(''); // Clear previous error
    try {
      const response = await fetch('http://127.0.0.1:8000/generate_mcq/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        setMcq({
          question: data.question,
          options: data.distractors, // Assuming distractors are returned by the backend
        });
      } else {
        setError('Error generating MCQ. Please try again.');
      }
    } catch (error) {
      setError('Error: Unable to connect to the backend.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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

      {error && (
        <div className="text-red-500 font-medium mt-2">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        className="w-full bg-black text-white py-2 rounded hover:opacity-90 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate MCQ'}
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
