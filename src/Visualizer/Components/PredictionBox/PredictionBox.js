import React, { Component } from 'react';
import Countdown from "./Countdown/Countdown.js";
import MinMaxTable from "./MinMaxTable/MinMaxTable.js";
import BarChart from "./Graph/BarChart.js";
import "./PredictionBox.css";
import Downloader from "../../../Parser/Downloader";
import FragmentHandler from "../../../Parser/FragmentHandler";

export default class PredictionBox extends Component{
    constructor(props){
        super(props);
        this.DATASET_URL = 'http://localhost:8080/latest';
        this._constructGraphData =this._constructGraphData.bind(this);
        this.state = {
            data: {},
            graphData: {},
            xValues: [],
        };

        this.graphDataCounter = {};
    }

    componentDidMount() {
        setInterval(() => {
            Downloader.download(this.DATASET_URL).then((fragment) => {
                FragmentHandler.handleFragment(fragment).then((returnObject) => {
                    console.log("download success");
                    this.setState({
                        data: returnObject,
                    });
                    this._constructGraphData();
                });
            }).catch(() => {
                    console.log("download error");
                }
            );
        }, 1000);
    }

    _constructGraphData(){
        let {data, graphData, xValues} = this.state;
        Object.keys(data).forEach((signalGroup) => {
            if(data[signalGroup]){
                if(!graphData[signalGroup]){
                    graphData[signalGroup] = [];
                }
                if(!xValues[signalGroup]){
                    xValues[signalGroup] = [];
                }
                if(!this.graphDataCounter[signalGroup]){
                    this.graphDataCounter[signalGroup] = 4;
                }
                if(graphData[signalGroup] && graphData[signalGroup].length > 20){
                    graphData[signalGroup].shift();
                }
                let generatedAtTime = data[signalGroup] && data[signalGroup].generatedAtTime;
                let countdown = data[signalGroup] && (new Date(data[signalGroup].minEndTime).getTime() - new Date(data[signalGroup].generatedAtTime)) / 1000;
                graphData[signalGroup].push({x: generatedAtTime, y: countdown});
                if(this.graphDataCounter[signalGroup]%4 === 0){
                    xValues[signalGroup].push(generatedAtTime);
                    this.graphDataCounter[signalGroup] = 0;
                }
                if(xValues[signalGroup].length > 5){
                    xValues[signalGroup].shift();
                }
                this.graphDataCounter[signalGroup]++;
            }
        });
        this.setState({
            graphData: graphData,
            xValues: xValues,
        });

    }

    render(){
        let { data, graphData, xValues } = this.state;
        let signalGroup = "https://opentrafficlights.org/id/signalgroup/K648/4";
        let countdown = data[signalGroup] && (new Date(data[signalGroup].minEndTime).getTime() - new Date(data[signalGroup].generatedAtTime)) / 1000;
        let minEndTime = data[signalGroup] && (new Date(data[signalGroup].minEndTime).getTime() - new Date(data[signalGroup].generatedAtTime)) / 1000;
        let maxEndTime = data[signalGroup] && (new Date(data[signalGroup].maxEndTime).getTime() - new Date(data[signalGroup].generatedAtTime)) / 1000;
        let color = "-1";
        if(data[signalGroup]){
            if(data[signalGroup].signalPhase === "https://w3id.org/opentrafficlights/thesauri/signalphase/6"){
                color = 6;
            }
            else if(data[signalGroup].signalPhase === "https://w3id.org/opentrafficlights/thesauri/signalphase/3"){
                color = 3;
            }
            else if(data[signalGroup].signalPhase === "https://w3id.org/opentrafficlights/thesauri/signalphase/0"){
                color = 0;
            }
        }

        return (
            <div className="PredictionBox">
                <Countdown count={countdown} color={color} className="PredictionBox_Countdown"/>
                <MinMaxTable min={minEndTime} max={maxEndTime} className="PredictionBox_MinMaxTable"/>
                <BarChart data={graphData[signalGroup]} xValues={xValues[signalGroup]} className="PredictionBox_BarChart"/>
            </div>
        )
    }
}