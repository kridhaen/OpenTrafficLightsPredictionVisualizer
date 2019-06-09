export default class TimeFrequencyDistribution {
    constructor(){
        this.frequencyDistribution = {};
    }

    add(signalGroup, signalPhase, year, month, day, hour, minutes, duration){
        if(!this.frequencyDistribution[signalGroup]){   //sg bestaat nog niet
            this.frequencyDistribution[signalGroup] = {};
        }
        if(!this.frequencyDistribution[signalGroup][signalPhase]){
            this.frequencyDistribution[signalGroup][signalPhase] = {};
        }
        if(!this.frequencyDistribution[signalGroup][signalPhase][year]){
            this.frequencyDistribution[signalGroup][signalPhase][year] = {};
        }
        if(!this.frequencyDistribution[signalGroup][signalPhase][year][month]){
            this.frequencyDistribution[signalGroup][signalPhase][year][month] = {};
        }
        if(!this.frequencyDistribution[signalGroup][signalPhase][year][month][day]){
            this.frequencyDistribution[signalGroup][signalPhase][year][month][day] = {};
        }
        if(!this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour]){
            this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour] = {};
        }
        if(!this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour][minutes]){
            this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour][minutes] = {};
        }
        if(!this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour][minutes][duration]){
            this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour][minutes][duration] = 1;
        }
        else {
            this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour][minutes][duration]++;
        }
    }

    getDistributions(){
        return this.frequencyDistribution;
    }

    get(signalGroup, signalPhase, year, month, day, hour, minutes){
        if(this.frequencyDistribution[signalGroup]
            && this.frequencyDistribution[signalGroup][signalPhase]
            && this.frequencyDistribution[signalGroup][signalPhase][year]
            && this.frequencyDistribution[signalGroup][signalPhase][year][month]
            && this.frequencyDistribution[signalGroup][signalPhase][year][month][day]
            && this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour]
            && this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour][minutes]
        ){
            return this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour][minutes];
        }
    }

    createDistributionsCSV(){
        let output = [];
        Object.keys(this.frequencyDistribution).forEach((signalGroup) => {
            Object.keys(this.frequencyDistribution[signalGroup]).forEach((signalPhase) => {
                Object.keys(this.frequencyDistribution[signalGroup][signalPhase]).forEach((year) => {
                    Object.keys(this.frequencyDistribution[signalGroup][signalPhase][year]).forEach((month) => {
                        Object.keys(this.frequencyDistribution[signalGroup][signalPhase][year][month]).forEach((day) => {
                            Object.keys(this.frequencyDistribution[signalGroup][signalPhase][year][month][day]).forEach((hour) => {
                                Object.keys(this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour]).forEach((minutes) => {
                                    let file = "signalGroup,signalphase,year,month,day,hour,minutes,duration,amount\n";
                                    Object.keys(this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour][minutes]).forEach((duration) => {
                                        file += signalGroup+','+signalPhase+','+year+','+month+','+day+','+hour+','+minutes+','+duration+','+this.frequencyDistribution[signalGroup][signalPhase][year][month][day][hour][minutes][duration]+'\n';
                                    });
                                    output.push(file);
                                });
                            });
                        });
                    });
                });
            });
        });
        return output;
    }
}