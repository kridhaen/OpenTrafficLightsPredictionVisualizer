import PredictionCalculator from './PredictionCalculator.js';

//TODO: als min === max, kan al terug geven voordat moet worden gerekend
//TODO: remove phaseDuration param -> debugging
//TODO: confidence -> vb %dat de predictedValue wel degelijk voorkwam tov alle voorkomens (die ook nog kunnen voorkomen, dus in futureDistribution)
export default class PredictionManager{
    //simple median value
    static predictLikelyTime(signalGroup, signalPhase, generatedAtTime, minEndTime, maxEndTime, phaseStart, distribution, predictionCalculatorFunction, maxDidIncrease){
        try {
            if (distribution && Object.keys(distribution).length > 0) {
                let result = new Date(phaseStart);
                let observationTime = new Date(generatedAtTime);

                let elapsedDuration = (observationTime.getTime() - result.getTime()) / 1000;
                let futureDistribution = {};
                Object.keys(distribution).forEach((key) => {    //calculate mean only over future durations, not past
                    if (key >= elapsedDuration) {  //TODO: should > or >= ?
                        futureDistribution[key] = distribution[key];
                    }
                });
                //if futureDistribution = empty -> predictedDuration = undefined
                let likelyTime = undefined;

                let predictedDuration = predictionCalculatorFunction(distribution);
                if(predictedDuration < elapsedDuration){
                    predictedDuration = predictionCalculatorFunction(futureDistribution);
                }
                // let distributionSize = Helper.countObservationsInDistribution(distribution);
                // console.log("size: "+distributionSize);   //TODO: log
                if(predictedDuration !== undefined){
                    result.setTime(result.getTime() + predictedDuration * 1000);
                    likelyTime = result.toISOString();
                }
                if (minEndTime && maxEndTime && minEndTime === maxEndTime) { //TODO: predict longer than max
                    likelyTime = minEndTime;
                } else if (likelyTime!== undefined && likelyTime < minEndTime) {
                    likelyTime = minEndTime;
                } else if (likelyTime !== undefined && !maxDidIncrease && likelyTime > maxEndTime ) {
                    likelyTime = maxEndTime;
                // } else if (likelyTime !== undefined && new Date(likelyTime).getTime() > new Date(maxEndTime).getTime()+210 && new Date(likelyTime).getTime() < new Date(maxEndTime).getTime() + 5000 ) {
                //     likelyTime = maxEndTime;
                }
                //TODO: als geen prediction meer mogelijk, maar alle historische waarden liggen onder minEndTime -> minEndTime als prediction (en omgekeerd voor max)?
                // if(likelyTime === undefined){
                //     likelyTime = minEndTime;
                // }

                // if(signalGroup === "https://opentrafficlights.org/id/signalgroup/K648/4" && signalPhase === "https://w3id.org/opentrafficlights/thesauri/signalphase/0"){
                //     console.log("----------------------------------------------------");
                //     console.log(futureDistribution);
                //     console.log(distribution);
                //     console.log("phaseStart: "+phaseStart);
                //     console.log("generatedAtTime: "+generatedAtTime);
                //     console.log("likelyTime: "+likelyTime);
                //     console.log(predictedDuration);
                //     console.log((new Date(likelyTime).getTime()-new Date(generatedAtTime).getTime())/1000);
                // }
                return likelyTime;   //TODO: undefined likelyTime if prediction not possible
            }
        } catch (e) {
            //console.log(e);
        }
    }

    //next is same as previous
    static predictLikelyTimeSamePrevious(lastPhaseDuration, signalGroup, signalPhase, minEndTime, maxEndTime, phaseStart){
        try {
            let result = new Date(phaseStart);
            let likelyTime = undefined;
            let predictedDuration = lastPhaseDuration;
            if(predictedDuration !== undefined){
                result.setTime(result.getTime() + predictedDuration * 1000);
                likelyTime = result.toISOString();
            }
            if (minEndTime && maxEndTime && minEndTime === maxEndTime) { //TODO: min en max niet precies -> duration komt soms niet helemaal overeen (zie hieronder) -> voorspelling zit afwijking op!!!
                likelyTime = minEndTime;
            } else if (likelyTime!== undefined && likelyTime < minEndTime) {
                likelyTime = minEndTime;
            } else if (likelyTime !== undefined && likelyTime > maxEndTime) {
                likelyTime = maxEndTime;
            }
            //TODO: als geen prediction meer mogelijk, maar alle historische waarden liggen onder minEndTime -> minEndTime als prediction (en omgekeerd voor max)?
            return likelyTime;   //TODO: undefined likelyTime if prediction not possible

        } catch (e) {
            //console.log(e);
        }
    }

    static predictLikelyTimeBasedOnPreviousPrediction(lastPhaseDuration, lastPredictedDuration, signalGroup, signalPhase, generatedAtTime, minEndTime, maxEndTime, phaseStart, distribution){
        try {
            if (distribution && Object.keys(distribution).length > 0) {
                let result = new Date(phaseStart);
                let observationTime = new Date(generatedAtTime);

                let elapsedDuration = (observationTime.getTime() - result.getTime()) / 1000;
                let futureDistribution = {};
                Object.keys(distribution).forEach((key) => {    //calculate mean only over future durations, not past
                    if (key > elapsedDuration) {  //TODO: should > or >= ?
                        futureDistribution[key] = distribution[key];
                    }
                });
                //if futureDistribution = empty -> predictedDuration = undefined
                let likelyTime = undefined;
                let lastPredictionRelativeError = (lastPredictedDuration-lastPhaseDuration)/lastPhaseDuration;
                let predictedDuration = PredictionCalculator.calculatePartDuration(futureDistribution, lastPredictionRelativeError);
                if(predictedDuration !== undefined){
                    result.setTime(result.getTime() + predictedDuration * 1000);
                    likelyTime = result.toISOString();
                }
                if (minEndTime && maxEndTime && minEndTime === maxEndTime) { //TODO: min en max niet precies -> duration komt soms niet helemaal overeen (zie hieronder) -> voorspelling zit afwijking op!!!
                    likelyTime = minEndTime;
                } else if (likelyTime!== undefined && likelyTime < minEndTime) {
                    likelyTime = minEndTime;
                } else if (likelyTime !== undefined && likelyTime > maxEndTime) {
                    likelyTime = maxEndTime;
                }
                //TODO: als geen prediction meer mogelijk, maar alle historische waarden liggen onder minEndTime -> minEndTime als prediction (en omgekeerd voor max)?
                return likelyTime;   //TODO: undefined likelyTime if prediction not possible
            }
        } catch (e) {
            //console.log(e);
        }
    }
}