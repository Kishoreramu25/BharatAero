import React from 'react';
import { AppProvider } from './context/AppContext';
import SimulatorFrame from './components/SimulatorFrame';
import './App.css';

function App() {
  return (
    <AppProvider>
      <SimulatorFrame />
    </AppProvider>
  );
}

export default App;
