import React, { Component } from 'react';
import 'react-vis/dist/style.css';
import {XYPlot, FlexibleXYPlot, VerticalBarSeries,LineSeries, LineMarkSeries, HorizontalGridLines, XAxis, YAxis} from 'react-vis';
import './Graph.css';

class LineChart extends Component {

    render() {
        const {minData, maxData, likelyData, title} = this.props;
        return (
            <div className="BarChart">
                <p>{title}</p>
                <XYPlot height={300} width={800} xType={"time"}>
                    <HorizontalGridLines />
                    <LineSeries data={minData} barWidth={0.95} color={"green"}/>
                    <LineSeries data={maxData} barWidth={0.95} color={"red"}/>
                    <LineSeries data={likelyData} barWidth={0.95} color={"blue"}/>
                    <XAxis title={"Time"}/>
                    <YAxis title={"Duration (s)"}/>
                </XYPlot>
            </div>
        );
    }
}

export default LineChart;