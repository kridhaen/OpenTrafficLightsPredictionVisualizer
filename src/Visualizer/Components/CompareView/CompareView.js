import React, { Component } from 'react';
import './CompareView.css';
import PredictionBox from "../PredictionBox/PredictionBox";

export default class CompareView extends Component{
    render(){

        return (
            <div className="CompareView">
                <div className="CompareView_left">
                    <PredictionBox datasetUrl={'https://lodi.ilabt.imec.be/observer/rawdata/latest'}/>
                </div>
                <div className="CompareView_right">
                    <PredictionBox datasetUrl={'http://localhost:8080/latest'}/>
                </div>
            </div>
        )
    }
}