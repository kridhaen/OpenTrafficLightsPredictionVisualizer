import React, { Component } from 'react';
import "./MinMaxTable.css"

export default class MinMaxTable extends Component{
    render(){
        const {min, max} = this.props;
        return (
            <div className="MinMaxTable" >
                <div className="MinMaxTable_minimum_box">
                    <div className="MinMaxTable_minimum_title">Minimum</div><div className="MinMaxTable_minimum_value">{min}</div>
                </div>
                <div className="MinMaxTable_maximum_box">
                    <div className="MinMaxTable_maximum_title">Maximum</div><div className="MinMaxTable_maximum_value">{max}</div>
                </div>
            </div>
        )
    }
}