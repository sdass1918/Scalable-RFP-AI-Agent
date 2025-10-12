// src/App.tsx
import { use, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleProcessRfp = async () => {
    if(!url) {
      setError("The url is required!");
      return;
    }
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await axios.post('http://localhost:3000/api/rfp/process', {url});
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
      {error && (
        <div>{error}</div>
      )}
      <h1>Agentic AI RFP Processor</h1>
      <div className="card">
        <input className='input' type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Website URL to Scan for RFPs..." />
        <div>The website url to scan for the RFPs is : </div>
        {url && (<div className='url'>{url}</div>)}
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