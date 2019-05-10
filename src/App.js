import React from 'react';
import './App.css';
import Drawer from "./Visualizer/Drawer.js";
import "./Visualizer/Drawer.css";
import "./Visualizer/SignalGroupDrawer.js";
import SignalGroupDrawer from "./Visualizer/SignalGroupDrawer";
import PredictionBox from "./Visualizer/Components/PredictionBox/PredictionBox.js";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/*<Drawer/>*/}
        {/*<SignalGroupDrawer/>*/}
        <PredictionBox datasetUrl={'https://lodi.ilabt.imec.be/observer/rawdata/latest'}/>
      </header>
    </div>
  );
}

export default App;
