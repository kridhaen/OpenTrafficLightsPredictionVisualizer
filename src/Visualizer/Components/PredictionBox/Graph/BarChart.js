import React, { Component } from 'react';
import 'react-vis/dist/style.css';
import {XYPlot, FlexibleXYPlot, VerticalBarSeries,LineSeries, HorizontalGridLines, XAxis, YAxis} from 'react-vis';
import './Graph.css';

class LineChart extends Component {

    render() {
        const {minData, maxData, likelyData, title, xValues} = this.props;
        console.log(xValues);
        return (
            <div className="BarChart">
                <p>{title}</p>
                <XYPlot height={300} width={1000} xType={"ordinal"}>
                    <HorizontalGridLines />
                    <LineSeries data={minData} barWidth={0.95} color={"green"}/>
                    <LineSeries data={likelyData} barWidth={0.95} color={"blue"}/>
                    <LineSeries data={maxData} barWidth={0.95} color={"red"}/>
                    <XAxis title={"Time"} tickValues={xValues}/>
                    <YAxis title={"Duration (s)"}/>
                </XYPlot>
            </div>
        );
    }
}

export default LineChart;