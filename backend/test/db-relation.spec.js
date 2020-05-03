const { promiseChecker, initEnv } = require('./init')
initEnv();
const db = require('../db')
const expect = require('chai').expect;




describe('DB', function () {
    this.beforeAll(async () => {
        db.sequelize.options.logging = false
        await db.sequelize.sync({ force: true });
        await db.initSuperadmin();
    })
    it('category', async () => {
        const category = await promiseChecker(db.Category.create({
            name: 'Dekanlık'
        }), true)
        await promiseChecker(db.Category.create({
            name1: 'Dekanlık'
        }), false)
        expect(category.id).to.eq(1)
        expect(category.name).to.eq('Dekanlık');
        await db.initCategories();
    })
    it('should create a unit', async () => {
        const polygon = {
            type: 'Polygon',
            coordinates: [
                [
                    [100.0, 0.0],
                    [101.0, 0.0],
                    [101.0, 1.0],
                    [100.0, 1.0],
                    [100.0, 0.0]
                ]
            ],
            crs: { type: 'name', properties: { name: 'EPSG:4326' } }
        };
        const unit = await promiseChecker(db.Unit.create({
            name: 'Bilgisayar Mühendisliği',
            category_id: 1,
            geom: polygon
        }), true);
        expect(unit).to.have.property('id')
        expect(unit).to.have.property('name')
        expect(unit).to.have.property('category_id')
        expect(unit).to.have.property('geom')
        expect(unit.id).to.equal(1)

    })
    it('should not create a unit', async () => {
        await promiseChecker(db.Unit.create({
            name: 'Bilgisayar Mühendisliği',
            category_id: 10,
        }), false);
    })
    it('should create a photo', async () => {
        const photo = await promiseChecker(db.Photo.create({
            unit_id: 1
        }), true);
        expect(photo).to.have.property('id')
        expect(photo).to.have.property('unit_id')
        expect(photo.id).to.equal(1)
    })
    it('should not create a photo', async () => {
        await promiseChecker(db.Photo.create({
            data: 'Photo.jpg'
        }), false);
    })
    it('should create a admin', async () => {
        const admin = await promiseChecker(db.Admin.create({
            username: 'ktubilisim',
            password: 'ktu123'
        }), true)
        expect(admin).to.have.property('id')
        expect(admin).to.have.property('username')
        expect(admin).to.have.property('password')
    })
    it('should not create a admin', async () => {
        await promiseChecker(db.Admin.create({
            username: 'ktubilisim',
            password: '1234'
        }), false)
    })
    it('get unit', async () => {
        await promiseChecker(db.Unit.findAll({
            where: {
                category_id: 5
            }
        }), true)
    })
});