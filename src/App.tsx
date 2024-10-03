import React from 'react';
import logo from './logo.svg';
import './App.css';
import PipelineManager from './components/PipelineManager';

function App() {
  return (
    <div className="">
      <div style={{ padding: '20px' }}>
        <div className='' style={{textAlign:"center"}}>
             <h1 className=''>Ado Pipeline Manager</h1>
        </div>
            <PipelineManager definitionId={20241002} /> {/* Replace with your definition ID */}
        </div>
    </div>
  );
}

export default App;
