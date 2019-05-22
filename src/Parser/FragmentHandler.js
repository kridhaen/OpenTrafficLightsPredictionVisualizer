import n3 from 'n3';
import Helper from './Helper.js';
const { DataFactory } = n3;
const { namedNode } = DataFactory;

export default class FragmentHandler {
    static async handleFragment(fragment) {
        let returnObject = {};

        let signalGroups = [];
        let {store, prefixes} = await Helper.parseAndStoreQuads(fragment);

        await store.getQuads(null, namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('https://w3id.org/opentrafficlights#Signalgroup')).forEach(quad => {
            signalGroups.push(quad.subject.value);
        });

        //only use most recent observation
        let observation = await store.getQuads(null, namedNode('http://www.w3.org/ns/prov#generatedAtTime'), null).sort(function (a, b) {
                a = new Date(a.object.value).getTime();
                b = new Date(b.object.value).getTime();

                return a > b ? -1 : a < b ? 1 : 0;
            }
        )[0];
        if(observation){
            let generatedAtTime = observation.object.value;

            signalGroups.forEach((signalGroup) => {
                let signalState = store.getQuads(namedNode(signalGroup), namedNode('https://w3id.org/opentrafficlights#signalState'), null, observation.subject)[0];
                if(signalState) {
                    let minEndTime = store.getQuads(signalState.object, namedNode('https://w3id.org/opentrafficlights#minEndTime'), null, observation.subject)[0].object.value;
                    let maxEndTime = store.getQuads(signalState.object, namedNode('https://w3id.org/opentrafficlights#maxEndTime'), null, observation.subject)[0].object.value;
                    let signalPhase = store.getQuads(signalState.object, namedNode('https://w3id.org/opentrafficlights#signalPhase'), null, observation.subject)[0].object.value;
                    let likelyTime = undefined;
                    try{
                        likelyTime = store.getQuads(signalState.object, namedNode('https://w3id.org/opentrafficlights#likelyTime'), null, observation.subject)[0].object.value;
                    }
                    catch (e) {
                        //TODO: clean!
                        console.log("no likelyTime");
                    }

                    if(!returnObject[signalGroup]){
                        returnObject[signalGroup] = {};
                    }
                    returnObject[signalGroup] = {
                        "generatedAtTime": generatedAtTime && new Date(generatedAtTime),
                        "minEndTime": minEndTime && new Date(minEndTime),
                        "maxEndTime": maxEndTime && new Date(maxEndTime),
                        "signalPhase": signalPhase,
                        "likelyTime": likelyTime && new Date(likelyTime)
                    }

                }
            });
        }

        return returnObject;
    }
}