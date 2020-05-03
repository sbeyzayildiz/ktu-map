const { promiseChecker, initEnv } = require('./init')
initEnv();
const chai = require('chai')
const expect = chai.expect
const supertest = require('supertest')
const app = require('../app')
const db = require('../db')


describe('App test', function () {

    let ADMIN_TOKEN = null;

    this.beforeAll(async () => {
        db.sequelize.options.logging = false
        await db.sequelize.sync({ force: true });
        await db.initSuperadmin();
        await db.initCategories();
    })
    it('get units', async () => {
        const res = await supertest(app)
            .get('/api/unit')

        expect(res.status).to.equal(200)
        expect(res.body.length).to.equal(0)
        // expect(res.body).to.have.property('id')
        // expect(res.body).to.have.property('name')
        // expect(res.body).to.have.property('description')
        // expect(res.body).to.have.property('telephone')
        // expect(res.body).to.have.property('website')
        // expect(res.body).to.have.property('category_id')
        // expect(res.body).to.have.property('parent_unit_id')
        // expect(res.body).to.have.property('geom')
    })

    it('login', async () => {
        const res = await supertest(app)
            .post('/api/login')
            .send({ username: process.env.ADMIN_USERNAME, password: '12121212' })
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('token')
        expect(res.body).to.have.property('username')
        expect(res.body.token).to.be.a('string')
        expect(res.body.username).to.be.a('string')

        const token = res.body.token;
        const base64 = token.split('.')[1];
        const json = Buffer.from(base64, 'base64').toString('utf8')
        const tokenPayload = JSON.parse(json)

        expect(tokenPayload).to.have.property('username')
        expect(tokenPayload).to.have.property('id')
        expect(tokenPayload).to.not.have.property('password')
        ADMIN_TOKEN = token;
    });

    it('get categories', async () => {
        const res = await supertest(app)
            .get('/api/category');
        expect(res.status).to.equal(200);
        expect(Array.isArray(res.body)).to.eq(true);
        expect(res.body.length).to.eq(8)
        for (const cat of res.body) {
            expect(cat).to.have.property('id')
            expect(cat).to.have.property('name')
        }
    })

    it('should not allowed 401', async () => {
        const res = await supertest(app).post('/api/unit');
        expect(res.status).to.eq(401)
    })
    it('should create unit', async () => {
        const res = await supertest(app).post('/api/unit')
            .query({ token: ADMIN_TOKEN })
            .send({
                name: 'Bilgisayar Mühendisliği',
                category_id: 3,
                geom: {
                    type: 'Polygon', coordinates: [
                        [
                            [100.0, 0.0],
                            [101.0, 0.0],
                            [101.0, 1.0],
                            [100.0, 1.0],
                            [100.0, 0.0],
                        ]
                    ],
                    crs: { type: 'name', properties: { name: 'EPSG:4326'} }
                }

            });
        expect(res.status).to.eq(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('category_id');
        expect(res.body).to.have.property('geom');
        expect(res.body).to.have.property('website');
        expect(res.body).to.have.property('telephone');
        expect(res.body).to.have.property('parent_unit_id');

    })



})
