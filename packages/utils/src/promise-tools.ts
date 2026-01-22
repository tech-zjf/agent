export class PromiseTools {
    static async sleep(m = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, m);
        });
    }
}
