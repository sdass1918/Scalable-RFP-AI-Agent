// src/App.tsx
import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessRfp = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await axios.post('http://localhost:3000/api/rfp/process');
      // Using JSON.stringify to display the object nicely formatted
      setResponse(JSON.stringify(result.data, null, 2));
    } catch (error) {
      console.error('Error processing RFP:', error);
      setResponse('An error occurred. Check the console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1>Agentic AI RFP Processor</h1>
      <div className="card">
        <button onClick={handleProcessRfp} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Start RFP Process'}
        </button>
      </div>
      {response && (
        <div className="response-area">
          <h2>Final Response:</h2>
          <pre>{response}</pre>
        </div>
      )}
    </>
  );
}

export default App;