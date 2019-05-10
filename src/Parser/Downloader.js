export default class Downloader{
    static download(_url){
        console.info("downloading: "+_url);
        return new Promise((resolve,reject) => {
            try {


                fetch(_url)
                    .then(function (response) {
                        resolve(response.text());
                    })
                    .catch(err => {
                        console.error(err);
                        reject(err)
                    });
            }catch (e) {
                console.error(_url);
            }
        });
    }
}
