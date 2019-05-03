import React, { Component } from 'react';
import Downloader from '../Parser/Downloader.js';
import FragmentHandler from '../Parser/FragmentHandler.js';

export default class SignalGroupDrawer extends Component{
    constructor(props){
        super(props);
        this.DATASET_URL = 'http://localhost:8080/latest';

        this.state = {
            data: {}
        };
    }

    componentDidMount() {
        setInterval(() => {
            Downloader.download(this.DATASET_URL).then((fragment) => {
                FragmentHandler.handleFragment(fragment).then((returnObject) => {
                    console.log("download success");
                    this.setState({
                        data: returnObject,
                    });
                })
            }).catch(() => {
                    console.log("download error");
                }
            );
        }, 1000);
    }

    render(){
        let { data } = this.state;
        console.log("render");
        return (
            <div className="Drawer">
                <table>
                    <thead>
                    <tr>
                        <th>SignalGroup</th>
                        <th>SignalPhase</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.keys(data).map((signalGroup) => {
                        return (
                            <tr>
                                <td>signalGroup: {signalGroup}</td>
                                <td>generatedAtTime: {data[signalGroup] ? data[signalGroup].generatedAtTime : "no data"}</td>
                                <td>minEndTime: {data[signalGroup] ? data[signalGroup].minEndTime : "no data"}</td>
                                <td>maxEndTime: {data[signalGroup] ? data[signalGroup].maxEndTime : "no data"}</td>
                                <td>signalPhase: {data[signalGroup] ? data[signalGroup].signalPhase : "no data"}</td>
                                <td>likelyTime: {data[signalGroup] ? data[signalGroup].likelyTime : "no data"}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        )
    }
}