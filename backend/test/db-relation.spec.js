const { promiseChecker } = require('./init')
const db = require('../db')
const expect = require('chai').expect;




describe('DB', function () {
    this.beforeAll(async () => {
        console.clear()
        await db.sequelize.sync({ force: true, logging: false });

        // await db.sequelize.sync()
    })
    it('category', async () => {
        const category = await promiseChecker(db.Category.create({
            name: 'Dekanlık'
        }), true)
        console.log('category id', category.id);
        await promiseChecker(db.Category.create({
            name1: 'Dekanlık'
        }), false)
        expect(category.id).to.eq(1)
        expect(category.name).to.eq('Dekanlık')
    })
    it('should create a unit', async () => {
        const unit = await promiseChecker(db.Unit.create({
            name: 'Bilgisayar Mühendisliği',
            category_id: 1,
        }), true);
        expect(unit).to.have.property('id')
        expect(unit).to.have.property('name')
        expect(unit).to.have.property('category_id')
        expect(unit.id).to.equal(1)

    })
    it('should not create a unit', async () => {
        await promiseChecker(db.Unit.create({
            name: 'Bilgisayar Mühendisliği',
            category_id: 10,
        }), false);
    })
});