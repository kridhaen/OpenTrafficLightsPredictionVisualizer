import n3 from 'n3';
import FragmentParser from "./Readers/FragmentParser";
import Helper from "../Parser/Helper";
import PredictionManager from "./Predictor/PredictionManager";
import DurationsManager from "./Distributions/DurationsManager";
import PredictionCalculator from "./Predictor/PredictionCalculator";
import TimeFrequencyDistribution from "./Distributions/Types/TimeFrequencyDistribution";
const { DataFactory } = n3;
const { namedNode, literal } = DataFactory;

export default class PredictionGenerator{
    constructor() {
        this.realTimeFragmentParser = new FragmentParser(false, false);
        this.timeDistribution = new TimeFrequencyDistribution();
    }

    async generatePredictions(fragment) {
        let result = "";
        await this.realTimeFragmentParser.handleFragment(fragment, undefined,
            (returnObject) => {
                let { signalGroup, signalPhase, signalState, generatedAtTime, minEndTime, maxEndTime, observation, store, lastPhaseStart, lastPhase, phaseStart, maxDidIncrease } = returnObject;
                let observationUTC = Helper.splitDateInParts(phaseStart);
                let phaseDuration = new Date(generatedAtTime).getTime() - new Date(lastPhaseStart).getTime();
                this.timeDistribution.add(signalGroup, lastPhase, observationUTC["year"], observationUTC["month"], observationUTC["day"], observationUTC["hour"], Math.floor(observationUTC["minute"]/20)*20, Math.round(phaseDuration/1000));
                let distribution = this.timeDistribution.get(signalGroup,signalPhase,observationUTC["year"],observationUTC["month"],observationUTC["day"],observationUTC["hour"],Math.floor(observationUTC["minute"]/20)*20);
                console.log(distribution);
                let likelyTime = PredictionManager.predictLikelyTime(signalGroup, signalPhase, generatedAtTime, minEndTime, maxEndTime, lastPhaseStart, distribution, PredictionCalculator.calculateMedianDuration, maxDidIncrease);
                likelyTime && store.addQuad(signalState.object, namedNode('https://w3id.org/opentrafficlights#likelyTime'), literal(likelyTime,namedNode("http://www.w3.org/2001/XMLSchema#date")), observation.subject);

            },
            (returnObject) => {
                let { signalGroup, signalPhase, signalState, generatedAtTime, minEndTime, maxEndTime, observation, store, lastPhaseStart, lastPhase, phaseStart, maxDidIncrease } = returnObject;
                let observationUTC = Helper.splitDateInParts(phaseStart);
                let distribution = this.timeDistribution.get(signalGroup,signalPhase,observationUTC["year"],observationUTC["month"],observationUTC["day"],observationUTC["hour"],Math.floor(observationUTC["minute"]/20)*20);
                console.log(distribution);
                let likelyTime = PredictionManager.predictLikelyTime(signalGroup, signalPhase, generatedAtTime, minEndTime, maxEndTime, lastPhaseStart, distribution, PredictionCalculator.calculateMedianDuration, maxDidIncrease);
                likelyTime && store.addQuad(signalState.object, namedNode('https://w3id.org/opentrafficlights#likelyTime'), literal(likelyTime,namedNode("http://www.w3.org/2001/XMLSchema#date")), observation.subject);
            },
            undefined
            ,
            async (returnObject) => {
                let { store, prefixes } = returnObject;
                await Helper.writeN3Store(store, prefixes).then((res) => {result = res});
            }
        );
        return result;
    };
}

