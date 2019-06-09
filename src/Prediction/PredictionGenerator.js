import n3 from 'n3';
import FragmentParser from "./Readers/FragmentParser";
import Helper from "../Parser/Helper";
import PredictionManager from "./Predictor/PredictionManager";
import DurationsManager from "./Distributions/DurationsManager";
import PredictionCalculator from "./Predictor/PredictionCalculator";
const { DataFactory } = n3;
const { namedNode, literal } = DataFactory;

export default class PredictionGenerator{
    constructor() {
        this.realTimeFragmentParser = new FragmentParser(false, false);
        this.durationsManager = new DurationsManager(25);
    }

    async generatePredictions(fragment) {
        let result = "";
        await this.realTimeFragmentParser.handleFragment(fragment, undefined,
            (returnObject) => {
                let { signalGroup, signalPhase, signalState, generatedAtTime, minEndTime, maxEndTime, observation, store, lastPhaseStart, lastPhase, phaseStart, maxDidIncrease } = returnObject;
                this.durationsManager.add(signalGroup, lastPhase, new Date(generatedAtTime).getTime()/1000 - new Date(lastPhaseStart).getTime()/1000);
                let distribution = this.durationsManager.getLastHistory(signalGroup, signalPhase);
                let likelyTime = PredictionManager.predictLikelyTime(signalGroup, signalPhase, generatedAtTime, minEndTime, maxEndTime, lastPhaseStart, distribution, PredictionCalculator.calculateMedianDuration, maxDidIncrease);
                likelyTime && store.addQuad(signalState.object, namedNode('https://w3id.org/opentrafficlights#likelyTime'), literal(likelyTime,namedNode("http://www.w3.org/2001/XMLSchema#date")), observation.subject);

            },
            (returnObject) => {
                let { signalGroup, signalPhase, signalState, generatedAtTime, minEndTime, maxEndTime, observation, store, lastPhaseStart, lastPhase, phaseStart, maxDidIncrease } = returnObject;
                let distribution = this.durationsManager.getLastHistory(signalGroup, signalPhase);
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

