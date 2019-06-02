import React, { Component } from 'react';
import 'react-vis/dist/style.css';
import {XYPlot, FlexibleXYPlot, VerticalBarSeries,LineSeries, LabelSeries, HorizontalGridLines, XAxis, YAxis} from 'react-vis';
import './Graph.css';

class PhaseColorGraph extends Component {

    render() {
        const {red, orange, green, title} = this.props;
        return (
            <div className="PhaseColorGraph">
                <p>{title}</p>
                <XYPlot height={100} width={800} xType={"time"}>
                    <LineSeries data={red} color={"red"}/>
                    <LineSeries data={orange} color={"orange"}/>
                    <LineSeries data={green} color={"green"}/>
                    <XAxis title={"Time"}/>
                    <YAxis title={"Color"} style={{
                         // line: {stroke: 'none'},
                        ticks: {stroke: 'none'},
                         text: {stroke: 'none', fill: 'none'}
                    }}/>
                </XYPlot>
            </div>
        );
    }
}

export default PhaseColorGraph;