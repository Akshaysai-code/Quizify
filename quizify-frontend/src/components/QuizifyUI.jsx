import React, { useState } from 'react';
import axios from 'axios';

function QuizifyUI() {
  const [inputText, setInputText] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState('');
  const [isGenerateButtonHovered, setIsGenerateButtonHovered] = useState(false);
  const [mcqs, setMcqs] = useState([]);

  const handleTextChange = (e) => setInputText(e.target.value);
  const handleNumQuestionsChange = (e) => setNumQuestions(parseInt(e.target.value, 10));

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'text/plain') {
        setFilePreview(null);
        const reader = new FileReader();
        reader.onload = (e) => setInputText(e.target.result);
        reader.readAsText(selectedFile);
      } else {
        setFilePreview(null);
        setError('Invalid file type. Please upload a .txt file or an image (.jpg, .jpeg, .png).');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputText.trim() === '') {
      setError('Please enter some text or upload a file.');
      return;
    }

    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/generate_mcq/', {
        text: inputText,
        num_questions: numQuestions
      });

      if (response.data && Array.isArray(response.data.mcqs)) {
        // Filter invalid MCQs (missing options or question)
        const validMCQs = response.data.mcqs.filter(
          (mcq) =>
            mcq.question &&
            Array.isArray(mcq.options) &&
            mcq.options.length === 4 &&
            mcq.answer
        );
        setMcqs(validMCQs);
      } else {
        setError('Backend returned an unexpected response format.');
      }
    } catch (error) {
      setError('Failed to generate questions. Please check the backend or try again.');
      console.error('❌ Error from backend:', error);
    }
  };

  const handleClear = () => {
    setInputText('');
    setFilePreview(null);
    setMcqs([]);
    setError('');
  };

  return (
    <div className="font-sans max-w-5xl mx-auto px-5 py-10 text-slate-800 bg-slate-50 min-h-screen">
      <header className="text-center mb-10">
        <h1 className="text-5xl text-sky-700 font-extrabold mb-2">Quizify</h1>
        <p className="text-slate-500 text-lg font-medium">Turning text into tests — your AI quizmaster at work!</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="mb-8 p-8 rounded-2xl bg-white border border-slate-200 shadow-md">
          <div className="mb-6">
            <label htmlFor="textInput" className="block font-bold mb-3 text-base text-slate-800">
              Enter Text:
            </label>
            <textarea
              id="textInput"
              value={inputText}
              onChange={handleTextChange}
              placeholder="Paste your paragraph here..."
              required
              className="w-full min-h-[150px] p-4 rounded-xl border border-slate-300 text-base resize-y"
            />
          </div>

          <div className="mb-6 flex flex-col gap-3">
            <label className="font-bold text-base text-slate-800">
              Or Upload a File:
              <span className="block text-sm text-slate-500 font-normal">📄 Text &nbsp;&nbsp;&nbsp; 🖼️ Image</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.jpg,.jpeg,.png"
                className="text-sm p-2 rounded-md border border-slate-300 bg-slate-50"
              />
              {filePreview && (
                <div className="w-[100px] h-[100px] overflow-hidden border border-slate-200 rounded-lg">
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="numQuestions" className="block font-bold mb-3 text-base text-slate-800">
              Number of Questions:
            </label>
            <select
              id="numQuestions"
              value={numQuestions}
              onChange={handleNumQuestionsChange}
              className="p-3 rounded-xl border border-slate-300 bg-white text-base w-[150px]"
            >
              <option value="3">3 questions</option>
              <option value="5">5 questions</option>
              <option value="10">10 questions</option>
              <option value="15">15 questions</option>
            </select>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-xl" role="alert">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <button
              type="reset"
              onClick={handleClear}
              className="px-6 py-3 rounded-full bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
            >
              Clear
            </button>
            <button
              type="submit"
              className={`px-6 py-3 rounded-full font-bold text-white flex items-center gap-2 transition-all shadow-md ${
                isGenerateButtonHovered ? 'bg-sky-500 shadow-lg translate-y-[-2px]' : 'bg-sky-400 shadow'
              }`}
              onMouseEnter={() => setIsGenerateButtonHovered(true)}
              onMouseLeave={() => setIsGenerateButtonHovered(false)}
            >
              Generate Questions
            </button>
          </div>
        </form>

        {mcqs.length > 0 && (
          <section className="mt-10 bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold text-sky-700 mb-6">Generated Questions</h2>
            <ul className="space-y-6">
              {mcqs.map((mcq, index) => (
                <li key={index} className="p-4 rounded-xl border border-slate-300 bg-slate-50">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">{index + 1}. {mcq.question}</h3>
                  <ul className="grid grid-cols-2 gap-2 text-slate-700">
                    {mcq.options.map((opt, i) => (
                      <li key={i} className="bg-white p-2 rounded-md border border-slate-200">
                        {String.fromCharCode(65 + i)}. {opt}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-green-600 font-medium">Answer: {mcq.answer}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default QuizifyUI;
