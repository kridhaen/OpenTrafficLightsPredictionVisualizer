import React, { Component } from 'react';
import './Countdown.css';

export default class Countdown extends Component{
    render(){
        const {count} = this.props;
        return (
            <div className="Countdown">
                <div className="Countdown_value">{count}</div>
            </div>
        )
    }
}