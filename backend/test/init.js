process.env.POSTGRES_HOST = 'localhost'
process.env.POSTGRES_PORT = '5554'
process.env.POSTGRES_USER = 'e2e-test-postgres'
process.env.POSTGRES_PASSWORD = 'e2e-test-postgres'
process.env.POSTGRES_DB = 'e2e-test-postgres'
const promiseChecker = async (promise, shouldPass, msg) => {
    let result;
    let err;
    let promiseResponse = null;
    try {
        promiseResponse = await promise
        result = true;
    } catch (error) {
        err = error
        result = false;
    }

    if(shouldPass !== result) {
        console.log(msg)
        if(err) {
            throw err;
        }
        throw new Error('promise checker failed')
    }
    return promiseResponse
    
}

module.exports = {
    promiseChecker
}