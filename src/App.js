import React from 'react';
import './App.css';
import Drawer from "./Visualizer/Drawer.js";
import "./Visualizer/Drawer.css";
import "./Visualizer/SignalGroupDrawer.js";
import SignalGroupDrawer from "./Visualizer/SignalGroupDrawer";


function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/*<Drawer/>*/}
        <SignalGroupDrawer/>
      </header>
    </div>
  );
}

export default App;
