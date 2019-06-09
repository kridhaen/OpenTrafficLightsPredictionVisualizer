import n3 from 'n3';
import Helper from '../../Parser/Helper.js';
const { DataFactory } = n3;
const { namedNode } = DataFactory;

//expect recieved fragments to be in ordered by time, increasing (oldest first)
export default class FragmentParser{
    constructor(showGeneratedAtTimeErrors = true, showPhaseErrors = true){
        this.phaseStart = {}; //om de start van een fase te detecteren, voor iedere observatie
        this.lastPhase = {}; //om de laatst tegengekomen fase op te slaan, voor iedere observatie
        this.lastMaxEndTime = {};   //als maxEndTime van de vorige meting kleiner is dan van de huidige, en de fase is niet aangepast, dan ontbreken waarschijnlijk enkele fragmenten
        this.lastMinEndTime = {};
        this.lastObservation = {};
        this.maxDidIncrease = {};
        this.showGeneratedAtTimeErrors = showGeneratedAtTimeErrors;
        this.showPhaseErrors = showPhaseErrors;

        //debug
        this.startUpObservations = 0;   //count observations needed for startup at start or after reset
        this.generatedBeforeLastErrors = 0; //count if generatedAtTime > last observation generatedAtTime
        this.onSamePhaseResets = 0; //count samePhase resets
        this.onPhaseChangeResets = 0;   //count phaseChange resets
        this.observationSameAsLast = 0; //count when generatedAtTime is same as last observed generatedAtTime

        this.realStartUpObservations = 0;   //count observations needed for startup
        this.realStartUp = {};  //is true if startup completed
    }

    printDebugInfo(){
        console.log("<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>");
        console.log("   FragmentParser debug info:");
        console.log("    - startUpObservations (reset included): "+this.startUpObservations);
        console.log("    - realStartUpObservations (startup only): "+this.realStartUpObservations);
        console.log("    - generatedBeforeLastErrors: "+this.generatedBeforeLastErrors);
        console.log("    - observationSameAsLast: "+this.observationSameAsLast);
        console.log("    - onSamePhaseResets: "+this.onSamePhaseResets);
        console.log("    - onPhaseChangeResets: "+this.onPhaseChangeResets);
        console.log("<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>");
    }

    static _initReturnObject(){
        return {
            "signalGroup": undefined,   //signalGroup of current observation
            "signalPhase": undefined,   //signalPhase of current observation
            "signalState": undefined,   //signalState quad (not used)
            "generatedAtTime": undefined,   //generation time of current observation
            "minEndTime": undefined,    //minEndTime defined in current observation
            "maxEndTime": undefined,    //maxEndTime defined in current observation
            "observation": undefined,   //observation quad (not used)
            "store": undefined, //n3 store object
            "prefixes": undefined,  //prefixes in trig rdf fragment
            "phaseStart": undefined,    //start of phase of current observation
            "lastPhaseStart": undefined,    //start of phase of last observation
            "lastPhase": undefined,  //phase of last observation
            "maxDidIncrease": undefined //maxEndTime did increase for same phase
        };
    }

    static _setReturnObject(returnObject, signalGroup, signalPhase, signalState, generatedAtTime, minEndTime, maxEndTime, observation, store, prefixes, phaseStart, lastPhaseStart, lastPhase, maxDidIncrease){
        returnObject["signalGroup"] = signalGroup;
        returnObject["signalPhase"] = signalPhase;
        returnObject["signalState"] = signalState;
        returnObject["generatedAtTime"] = generatedAtTime;
        returnObject["minEndTime"] = minEndTime;
        returnObject["maxEndTime"] = maxEndTime;
        returnObject["observation"] = observation;
        returnObject["store"] = store;
        returnObject["prefixes"] = prefixes;
        returnObject["phaseStart"] = phaseStart;
        returnObject["lastPhaseStart"] = lastPhaseStart;
        returnObject["lastPhase"] = lastPhase;
        returnObject["maxDidIncrease"] = maxDidIncrease;
    };

    //TODO: remove file param -> debugging
    async handleFragment(fragment, file, onPhaseChange, onSamePhase, onObservationBeforeValidityCheck, afterHandle, onFragmentError){
        let returnObject = FragmentParser._initReturnObject();
        let { store, prefixes } = await Helper.parseAndStoreQuads(fragment);

        let signalGroups = [];

        await store.getQuads(null, namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('https://w3id.org/opentrafficlights#Signalgroup')).forEach(quad => {
            signalGroups.push(quad.subject.value);
            if(!this.phaseStart[quad.subject.value]){
                this.phaseStart[quad.subject.value] = -1;
            }
            if(!this.lastPhase[quad.subject.value]){
                this.lastPhase[quad.subject.value] = -1;
            }
            if(!this.lastMaxEndTime[quad.subject.value]){
                this.lastMaxEndTime[quad.subject.value] = -1;
            }
            if(!this.lastMinEndTime[quad.subject.value]){
                this.lastMinEndTime[quad.subject.value] = -1;
            }
            if(!this.lastObservation[quad.subject.value]){
                this.lastObservation[quad.subject.value] = undefined;
            }
            if(!this.maxDidIncrease[quad.subject.value]){
                this.maxDidIncrease[quad.subject.value] = {};
            }
            if(!this.realStartUp[quad.subject.value]){
                this.realStartUp[quad.subject.value] = 0;
            }
        });

        //als de eerste observatie in een fragment niet overeenkomt met zijn naam, als die een bestandsnaam heeft, dan is het fragment in de historicfilesystemreader ingelezen niet geldig,
        //want dan kan de chronologische ordening volgens bestandsnaam niet worden gegarandeerd.
        let isFragmentValid = true;
        if(file){
            let firstObservation = await store.getQuads(null, namedNode('http://www.w3.org/ns/prov#generatedAtTime'), null).sort(function(a, b) {
                    a = new Date(a.object.value).getTime();
                    b = new Date(b.object.value).getTime();

                    return a<b ? -1 : a>b ? 1 : 0;
                }
            )[0];
            if(!firstObservation){
                isFragmentValid = false;
            }
            else{
                let firstObservationName = "fragment_" + (firstObservation.object.value).replace(/\:/g,"_").replace(/\./g,"_") + ".trig";
                if( firstObservationName !== file){
                    console.log("\x1b[31m","Filename is not correct: "+file + ", first observation: "+firstObservationName,"\x1b[0m");
                    isFragmentValid = false;
                }
            }
        }
        if(isFragmentValid) {
            //overlopen van alle observaties in een fragment, gesorteerd met oudste eerst
            await store.getQuads(null, namedNode('http://www.w3.org/ns/prov#generatedAtTime'), null).sort(function (a, b) {
                    a = new Date(a.object.value).getTime();
                    b = new Date(b.object.value).getTime();

                    return a < b ? -1 : a > b ? 1 : 0;
                }
            ).forEach((observation) => {
                let generatedAtTime = observation.object.value;

                signalGroups.forEach(signalGroup => {
                    let error = 0;
                    if (this.lastObservation[signalGroup]) {
                        if (new Date(this.lastObservation[signalGroup]).getTime() > new Date(generatedAtTime).getTime()) {
                            this.showGeneratedAtTimeErrors && console.log(file + " : Observation: " + generatedAtTime + " signalGroup: " + signalGroup + " | last observation bigger than new: " + this.lastObservation[signalGroup] + " - " + generatedAtTime);
                            this.generatedBeforeLastErrors++;
                            error = 1;
                        }

                        //latest fragments can contain the same observation, previous fragments should not contain duplicate
                        //no code breaking bug, but can be nice to know -> logged
                        if (generatedAtTime === this.lastObservation[signalGroup]) {
                            this.showGeneratedAtTimeErrors && console.log("generatedAtTime " + generatedAtTime + " is same as last " + this.lastObservation[signalGroup] + " sg: " + signalGroup);
                            this.observationSameAsLast++;
                        }
                    }

                    let signalState = store.getQuads(namedNode(signalGroup), namedNode('https://w3id.org/opentrafficlights#signalState'), null, observation.subject)[0]; //zit altijd 1 of geen in, als de signalstate is aangepast op generatedAtTime voor de opgegeven signalgroup
                    if (signalState) {
                        let minEndTime = store.getQuads(signalState.object, namedNode('https://w3id.org/opentrafficlights#minEndTime'), null, observation.subject)[0].object.value;
                        let maxEndTime = store.getQuads(signalState.object, namedNode('https://w3id.org/opentrafficlights#maxEndTime'), null, observation.subject)[0].object.value;
                        let signalPhase = store.getQuads(signalState.object, namedNode('https://w3id.org/opentrafficlights#signalPhase'), null, observation.subject)[0].object.value;

                        //debug
                        if (generatedAtTime > maxEndTime) {
                            console.log("fragment contains observation generated after maxEndTime: " + file);
                        }

                        if (this.phaseStart[signalGroup] !== -1 && this.lastPhase[signalGroup] !== -1) {
                            if (this.realStartUp[signalGroup] === 0) {    //TODO: debug info
                                this.realStartUp[signalGroup] = 1;   //debug info
                            }
                            if (this.lastPhase[signalGroup] !== signalPhase) {
                                //phase change
                                if (onObservationBeforeValidityCheck) { //dangerous, not checked validity of observation before phase change, data could be invalid (see checks)
                                    FragmentParser._setReturnObject(returnObject, signalGroup, signalPhase, signalState, generatedAtTime, minEndTime, maxEndTime, observation, store, prefixes, generatedAtTime, this.phaseStart[signalGroup], this.lastPhase[signalGroup], this.maxDidIncrease[signalGroup][signalPhase]);
                                    onObservationBeforeValidityCheck(returnObject);
                                }
                                if(!error) {
                                    //kruispunt publiceerd om de 200 ms, observer neemt waar bij aanpassing aan fase. Als fase gaat aanpassen (maxEndTime), gaat hij nog een bericht sturen
                                    //dat aangeeft dat het nog niet is aangepast, maar NU gaat aanpassen. De observer neemt pas het volgende bericht dat weldegelijk is aangepast weer,
                                    //en dat bericht komt dus 200 ms later dan het werkelijke moment waarop de aanpassing ging gebeuren.
                                    //vandaar de 200 ms check
                                    //soms is generatedAtTime-200ms net 1 ms later dan lastMaxEndTime
                                    //nog 1 ms extra rekenen
                                    //soms ook net wat langer (2 - 5 ms)
                                    //bij min hoeft niet worden aangepast, want komt zelden voor (anders ook +205 bij lastMinEndTime)
                                    if (new Date(generatedAtTime).getTime() > new Date(this.lastObservation[signalGroup]).getTime()+5000 &&
                                        ((this.lastMaxEndTime[signalGroup] !== -1 && new Date(generatedAtTime).getTime() > new Date(this.lastMaxEndTime[signalGroup]).getTime() + 210)
                                            || (this.lastMinEndTime[signalGroup] !== -1 && generatedAtTime < this.lastMinEndTime[signalGroup]))
                                    ) {
                                        //phase can't end after maxEndTime and before minEndTime, if this is the case, it is not the same phase or an error occurred in the data
                                        this.lastPhase[signalGroup] = -1;   //reset
                                        this.phaseStart[signalGroup] = -1;
                                        this.onPhaseChangeResets++;
                                        this.showPhaseErrors && console.log("onPhaseChangeError: " + file + " generatedAtTime: " + generatedAtTime + " maxEndTime: " + maxEndTime + " lastMaxEndTime: " + this.lastMaxEndTime[signalGroup] + " lastMinEndTime: " + this.lastMinEndTime[signalGroup] + " last observation (gereratedAtTime): " + this.lastObservation[signalGroup]);
                                        if (onFragmentError) {
                                            onFragmentError(signalGroup);
                                        }
                                        this.lastMaxEndTime[signalGroup] = -1;  //maximale eindtijd laatste fragment
                                        this.lastMinEndTime[signalGroup] = -1; //minimale eindtijd laatste fragment
                                    } else {
                                        if (onPhaseChange) {
                                            FragmentParser._setReturnObject(returnObject, signalGroup, signalPhase, signalState, generatedAtTime, minEndTime, maxEndTime, observation, store, prefixes, generatedAtTime, this.phaseStart[signalGroup], this.lastPhase[signalGroup], this.maxDidIncrease[signalGroup][signalPhase]);
                                            onPhaseChange(returnObject);
                                        }

                                        //prepare for next phase
                                        this.lastPhase[signalGroup] = signalPhase;
                                        this.phaseStart[signalGroup] = generatedAtTime;

                                        this.lastMaxEndTime[signalGroup] = maxEndTime;  //maximale eindtijd laatste fragment
                                        this.lastMinEndTime[signalGroup] = minEndTime; //minimale eindtijd laatste fragment
                                    }
                                }
                            } else {
                                //same phase
                                if (onObservationBeforeValidityCheck) { //dangerous, not checked validity of observation before phase change, data could be invalid (see checks)
                                    FragmentParser._setReturnObject(returnObject, signalGroup, signalPhase, signalState, generatedAtTime, minEndTime, maxEndTime, observation, store, prefixes, this.phaseStart[signalGroup], this.phaseStart[signalGroup], this.lastPhase[signalGroup], this.maxDidIncrease[signalGroup][signalPhase]);
                                    onObservationBeforeValidityCheck(returnObject);
                                }
                                if(!error) {
                                    //lodi.ilabt.imec.be onnauwkeurige data -> soms meerdere observaties max verhoogt
                                    //als observatie op zelfde moment is gemaakt, kan die eens met en grotere maxEndTime worden ingelezen, als die dan eerst wordt verwerkt is de voorwaarde
                                    //niet meer voldaan en is er mogelijks een gat, terwijl dit niet echt kan, want op hetzelfde moment aangemaakt
                                    //als zelfde generatedAtTime als vorige -> niet controleren op gat
                                    //(zou ook gewoon kunnen sorteren op max en min etc, maar meer computationeel werk)
                                    if (new Date(generatedAtTime).getTime() > new Date(this.lastObservation[signalGroup]).getTime()+5000 &&
                                        ((this.lastMaxEndTime[signalGroup] !== -1 && new Date(maxEndTime).getTime() > new Date(this.lastMaxEndTime[signalGroup]).getTime() + 1005)
                                            || (this.lastMinEndTime[signalGroup] !== -1 && new Date(minEndTime).getTime() + 1005 < new Date(this.lastMinEndTime[signalGroup]).getTime()))
                                    ) {
                                        //maxEndTime can not increase for same phase, minEndTime can not decrease, if this is the case, it is not the same phase or an error occurred in the data
                                        //if id does increase and it is correct, the time between observations can not be greater than 5 seconds (tolerance)
                                        this.lastPhase[signalGroup] = -1;   //reset
                                        this.phaseStart[signalGroup] = -1;
                                        this.showPhaseErrors && console.log("onSamePhaseError: " + file + " generatedAtTime: " + generatedAtTime + " maxEndTime: " + maxEndTime + " lastMaxEndTime: " + this.lastMaxEndTime[signalGroup] + " minEndTime: " + minEndTime + " lastMinEndTime: " + this.lastMinEndTime[signalGroup] + " last observation (gereratedAtTime): " + this.lastObservation[signalGroup]);
                                        this.onSamePhaseResets++;

                                        if (onFragmentError) {
                                            onFragmentError(signalGroup);
                                        }
                                        this.lastMaxEndTime[signalGroup] = -1;  //maximale eindtijd laatste fragment
                                        this.lastMinEndTime[signalGroup] = -1; //minimale eindtijd laatste fragment
                                    } else {
                                        if(this.maxDidIncrease[signalGroup][signalPhase] !== true){ //see increase in maxEndTime only if higher than 1005 ms (tolerance)
                                            this.maxDidIncrease[signalGroup][signalPhase] = new Date(maxEndTime).getTime() > new Date(this.lastMaxEndTime[signalGroup]).getTime() + 1005;
                                        }
                                        if (onSamePhase) {
                                            FragmentParser._setReturnObject(returnObject, signalGroup, signalPhase, signalState, generatedAtTime, minEndTime, maxEndTime, observation, store, prefixes, this.phaseStart[signalGroup], this.phaseStart[signalGroup], this.lastPhase[signalGroup], this.maxDidIncrease[signalGroup][signalPhase]);
                                            onSamePhase(returnObject);
                                        }
                                        this.lastMaxEndTime[signalGroup] = maxEndTime;  //maximale eindtijd laatste fragment
                                        this.lastMinEndTime[signalGroup] = minEndTime; //minimale eindtijd laatste fragment
                                    }
                                }
                            }
                        } else {
                            if(!error) {
                                if (this.realStartUp[signalGroup] === 0) {    //TODO: debug info
                                    this.realStartUpObservations++;
                                }
                                this.startUpObservations++;
                                if (this.phaseStart[signalGroup] === -1 && this.lastPhase[signalGroup] === -1) {
                                    this.lastPhase[signalGroup] = signalPhase;
                                } else if (this.lastPhase[signalGroup] !== signalPhase) {
                                    this.lastPhase[signalGroup] = signalPhase;
                                    this.phaseStart[signalGroup] = generatedAtTime;
                                }
                                this.lastMaxEndTime[signalGroup] = maxEndTime;  //maximale eindtijd laatste fragment
                                this.lastMinEndTime[signalGroup] = minEndTime; //minimale eindtijd laatste fragment
                            }
                        }
                        // this.lastMaxEndTime[signalGroup] = maxEndTime;  //maximale eindtijd laatste fragment
                        // this.lastMinEndTime[signalGroup] = minEndTime; //minimale eindtijd laatste fragment
                        if(!error){
                            this.lastObservation[signalGroup] = generatedAtTime;
                        }
                    }

                });

            });
        }
        if(afterHandle){
            FragmentParser._setReturnObject(returnObject, undefined, undefined, undefined, undefined, undefined, undefined, undefined, store, prefixes, undefined, undefined, undefined, undefined);
            afterHandle(returnObject);
        }
    }

}