import React, { Component } from 'react';
import Countdown from "./Countdown/Countdown.js";
import MinMaxTable from "./MinMaxTable/MinMaxTable.js";
import BarChart from "./Graph/BarChart.js";
import "./PredictionBox.css";

export default class PredictionBox extends Component{
    render(){
        const data = [
            {x: 0, y: 65},
            {x: 1, y: 64},
            {x: 2, y: 62},
            {x: 3, y: 60},
            {x: 4, y: 55},
            {x: 5, y: 50},
            {x: 6, y: 48},
            {x: 7, y: 47},
            {x: 8, y: 46},
            {x: 9, y: 45}
        ];
        return (
            <div className="PredictionBox">
                <Countdown count={45} className="PredictionBox_Countdown"/>
                <MinMaxTable min={35} max={60} className="PredictionBox_MinMaxTable"/>
                <BarChart data={data} className="PredictionBox_BarChart"/>
            </div>
        )
    }
}