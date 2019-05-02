import n3 from 'n3';

export default class Helper{
    static parseAndStoreQuads(_doc) {
        return new Promise(resolve => {
            const parser = new n3.Parser();
            const store = new n3.Store();
            parser.parse(_doc, (error, quad, prefixes) => {
                if (quad)
                    store.addQuad(quad);
                else
                    return resolve({"store": store, "prefixes": prefixes});
            });
        })
    }

    static writeN3Store(store, prefixes){
        return new Promise(async (resolve) => {
            const writer = new n3.Writer({ "prefixes": prefixes});
            for(let quad of store.getQuads()){
                writer.addQuad(quad);
            }

            await writer.end((error, result) => {resolve(result)});
        });
    }

    static splitDateInParts(timeDate){
        let result = {};
        let toDate = new Date(timeDate);
        result["hour"] = toDate.getUTCHours();
        result["month"] = toDate.getUTCMonth();
        result["minute"] = toDate.getUTCMinutes();
        result["day"] = toDate.getUTCDay();    //0 == sunday
        result["year"] = toDate.getUTCFullYear();
        return result;
    }
}