const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const app = require('./app')
const db = require('./db');

const init = async () => {
    await db.sequelize.sync({ force: false });
    await db.initSuperadmin();
    await db.initCategories();
    console.log('DB SYNCED USERADMIN CREATED')
}
init();

app.listen('8080', () => {
    console.log('!!!----- APP STARTED ------ !!!')
})
