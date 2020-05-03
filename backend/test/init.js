const initEnv = () => {
    process.env.POSTGRES_HOST = 'localhost';
    process.env.POSTGRES_PORT = '5554';
    process.env.POSTGRES_USER = 'e2e-test-postgres';
    process.env.POSTGRES_PASSWORD = 'e2e-test-postgres';
    process.env.POSTGRES_DB = 'e2e-test-postgres';
    process.env.JWT_KEY = 'FOOBAR';
    process.env.ADMIN_USERNAME = 'test-superadmin';
    // plain admin password = '12121212'
    process.env.ADMIN_PASSWORD = '591f110c5f0e1bdce3ce99ee4d25a60959f343e90d120e4d473e3ccae5811d5d07cd991a64b6f18ef670b772d48adbb9c08206bb99e621b60046b3921b204b77';
}
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

    if (shouldPass !== result) {
        console.log(msg)
        if (err) {
            throw err;
        }
        throw new Error('promise checker failed')
    }
    return promiseResponse

}

module.exports = {
    promiseChecker,
    initEnv
}