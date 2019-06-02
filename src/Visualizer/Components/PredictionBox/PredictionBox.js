import React, { Component } from 'react';
import Countdown from "./Countdown/Countdown.js";
import MinMaxTable from "./MinMaxTable/MinMaxTable.js";
import BarChart from "./Graph/BarChart.js";
import PhaseColorGraph from "./PhaseColorGraph/PhaseColorGraph.js";
import "./PredictionBox.css";
import Downloader from "../../../Parser/Downloader";
import FragmentHandler from "../../../Parser/FragmentHandler";
import Dropdown from "./Selector/Dropdown";
import ErrorBox from "./Error/ErrorBox";

export default class PredictionBox extends Component{
    constructor(props){
        super(props);
        this.DATASET_URL = props.datasetUrl;
        this._constructGraphData =this._constructGraphData.bind(this);
        this._constructColorGraphData = this._constructColorGraphData.bind(this);
        this._constructSignalGroup = this._constructSignalGroup.bind(this);
        this.setActiveSignalGroup = this.setActiveSignalGroup.bind(this);
        this.state = {
            data: {},
            colorData: {},
            colorDataOldest: {},
            minEndTimeGraphData: {},
            maxEndTimeGraphData: {},
            likelyTimeGraphData: {},
            signalGroups: {},
            activeSignalGroup: "https://opentrafficlights.org/id/signalgroup/K648/4",
        };
    }

    componentDidMount() {
        setInterval(() => {
            Downloader.download(this.DATASET_URL).then((fragment) => {
                FragmentHandler.handleFragment(fragment).then((returnObject) => {
                    // console.log("download success:"+this.DATASET_URL);
                    this.setState({
                        data: returnObject,
                    });
                    this._constructGraphData("minEndTime", "minEndTimeGraphData");
                    this._constructGraphData("maxEndTime", "maxEndTimeGraphData");
                    this._constructGraphData("likelyTime", "likelyTimeGraphData");
                    this._constructColorGraphData();
                    this._constructSignalGroup(Object.keys(returnObject));
                });
            }).catch(() => {
                    console.error("download error"+this.DATASET_URL);
                }
            );
        }, 1000);
    }

    _constructColorGraphData(){
        let {data, colorData, colorDataOldest} = this.state;
        Object.keys(data).forEach((signalGroup) => {
            if(data[signalGroup]){
                if(!colorData[signalGroup]){
                    colorData[signalGroup] = {};
                }
                if(!colorData[signalGroup][data[signalGroup].signalPhase]){
                    colorData[signalGroup][data[signalGroup].signalPhase] = [];
                }
                if(!colorDataOldest[signalGroup]){
                    colorDataOldest[signalGroup] = [];
                }
                if(colorDataOldest[signalGroup].length > 20){
                    let deletedPhase = colorDataOldest[signalGroup].shift();
                    colorData[signalGroup][deletedPhase].shift();
                }
                let generatedAtTime = data[signalGroup] && data[signalGroup].generatedAtTime;
                colorData[signalGroup][data[signalGroup].signalPhase].push({x: generatedAtTime, y: 1});
                colorDataOldest[signalGroup].push(data[signalGroup].signalPhase);
            }
        });
        let newState = {};
        newState.colorData = colorData;
        newState.colorDataOldest = colorDataOldest;
        this.setState(newState);
    }

    _constructGraphData(type, graph){
        let {data} = this.state;
        let graphData = this.state[graph];
        Object.keys(data).forEach((signalGroup) => {
            if(data[signalGroup]){
                if(!graphData[signalGroup]){
                    graphData[signalGroup] = [];
                }
                if(graphData[signalGroup] && graphData[signalGroup].length > 20){
                    graphData[signalGroup].shift();
                }
                let generatedAtTime = data[signalGroup] && data[signalGroup].generatedAtTime;
                let countdown = data[signalGroup] && (new Date(data[signalGroup][type]).getTime() - new Date(data[signalGroup].generatedAtTime)) / 1000;
                graphData[signalGroup].push({x: generatedAtTime, y: countdown});
            }
        });
        let newState = {};
        newState[graph] = graphData;
        this.setState(newState);
    }

    _constructSignalGroup(newSignalGroups){
        let { signalGroups, activeSignalGroup } = this.state;
        newSignalGroups.forEach((sg) => {
            signalGroups[sg] = 0;
            if(activeSignalGroup !== undefined){
                activeSignalGroup = sg;
            }
        });
        this.setState({
            signalGroups: signalGroups,
            activeSignalGroup: activeSignalGroup,
        });
    }

    setActiveSignalGroup(signalGroup){
        this.setState({
            data: {},
            colorData: {},
            colorDataOldest: {},
            minEndTimeGraphData: {},
            maxEndTimeGraphData: {},
            likelyTimeGraphData: {},
            activeSignalGroup: signalGroup,
        });
    }

    render(){
        let { signalGroups, activeSignalGroup, data, minEndTimeGraphData, maxEndTimeGraphData, likelyTimeGraphData, colorData } = this.state;
        let signalGroup = activeSignalGroup;
        let countdown = data[signalGroup] && data[signalGroup].likelyTime && (data[signalGroup].likelyTime.getTime() - data[signalGroup].generatedAtTime) / 1000;
        let minEndTime = data[signalGroup] && (data[signalGroup].minEndTime.getTime() - data[signalGroup].generatedAtTime) / 1000;
        let maxEndTime = data[signalGroup] && (data[signalGroup].maxEndTime.getTime() - data[signalGroup].generatedAtTime) / 1000;
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

        let redData = colorData[signalGroup] && colorData[signalGroup]["https://w3id.org/opentrafficlights/thesauri/signalphase/3"];
        let greenData = colorData[signalGroup] && colorData[signalGroup]["https://w3id.org/opentrafficlights/thesauri/signalphase/6"];
        let orangeData = colorData[signalGroup] && colorData[signalGroup]["https://w3id.org/opentrafficlights/thesauri/signalphase/0"];

        if(Object.keys(data).length === 0){
            return(
                <ErrorBox message={"No data returned: "+this.DATASET_URL}/>
            )
        }

        return (
            <div className="PredictionBox">
                <Dropdown options={signalGroups} activeValue={activeSignalGroup} onChange={this.setActiveSignalGroup}/>
                <Countdown count={countdown} color={color} className="PredictionBox_Countdown"/>
                <MinMaxTable min={minEndTime} max={maxEndTime} className="PredictionBox_MinMaxTable"/>
                <BarChart minData={minEndTimeGraphData[signalGroup]} maxData={maxEndTimeGraphData[signalGroup]} likelyData={likelyTimeGraphData[signalGroup]} className="PredictionBox_BarChart"/>
                <PhaseColorGraph red={redData} green={greenData} orange={orangeData} className="PredictionBox_PhaseColorGraph"/>
            </div>
        )
    }
}