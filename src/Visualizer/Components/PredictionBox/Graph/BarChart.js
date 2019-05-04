import React, { Component } from 'react';
import 'react-vis/dist/style.css';
import {XYPlot, VerticalBarSeries,LineSeries, HorizontalGridLines, XAxis, YAxis} from 'react-vis';
import './Graph.css';

class LineChart extends Component {

    render() {
        const {data, title} = this.props;
        return (
            <div className="BarChart">
                <p>{title}</p>
                <XYPlot height={300} width={1000} xType={"ordinal"}>
                    <HorizontalGridLines />
                    <LineSeries data={data} barWidth={0.95}/>
                    <XAxis title={"Time"}/>
                    <YAxis title={"Duration (s)"}/>
                </XYPlot>
            </div>
        );
    }
}

export default LineChart;