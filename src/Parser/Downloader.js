export default class Downloader{
    static download(_url){
        console.log("\x1b[32m","downloading: "+_url,"\x1b[0m");
        return new Promise((resolve,reject) => {

            fetch(_url)
                .then(function(response) {
                    resolve(response.text());
                })
                .catch(err => {console.log("\x1b[31m\x1b[47m",err,"\x1b[0m"); reject(err)});
        });
    }
}
