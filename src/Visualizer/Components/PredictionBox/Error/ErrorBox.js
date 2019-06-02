import React, { Component } from 'react';
import "./ErrorBox.css";

export default class ErrorBox extends Component{
    constructor(props){
        super(props);
        this.state = {
            show: true
        };
        this.onClick = this.onClick.bind(this);
    }

    onClick(){
        this.setState({
            show: false
        });
    }

    render(){
        let {show} = this.state;
        if(show !== false){
            return (
                <div className="ErrorBox_alert">
                    <span className="ErrorBox_alertCloseBtn" onClick={this.onClick}>&times;</span>
                    {this.props.message}
                </div>)
        }
        else{
            return null;
        }
    }
}
