import React, { Component } from 'react';
import './Countdown.css';

export default class Countdown extends Component{
    render(){
        const {count, color} = this.props;
        let textColor = "white";
        if(color === 0){
            textColor = "orange";
        }
        if(color === 3){
            textColor = "red";
        }
        if(color === 6){
            textColor = "green";
        }
        return (
            <div className="Countdown">
                <div className="Countdown_value" style={{color: textColor}}>{count}</div>
            </div>
        )
    }
}