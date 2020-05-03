const express = require('express')
const app = express()
const db = require('./db');
const hasha = require('hasha');
const jsonwebtoken = require('jsonwebtoken')

class HttpError extends Error { }
const envChecker = () => {
    const array = [
        'POSTGRES_HOST',
        'POSTGRES_PORT',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD',
        'POSTGRES_DB',
        'ADMIN_USERNAME',
        'ADMIN_PASSWORD',
        'JWT_KEY',
    ];
    for (const key of array) {
        if (!process.env[key]) {
            throw new Error(`process.env.${key} undefined`)
        } else {
            console.log(process.env[key])
        }
    }
}
envChecker();


app.use(express.json());
const isAdminMiddleware = async (req, res, next) => {
    try {
        const token = req.query.token;
        if (!token) {
            throw new HttpError('UnAuthorized')
        }
        console.log('token', token)
        const obj = jsonwebtoken.verify(token, process.env.JWT_KEY);
        next();
    } catch (error) {
        return res.status(401).json({});
    }

}
app.get('/api/unit', async function (req, res) {
    const units = await db.Unit.findAll()
    res.status(200).json(units)
})
app.get('/api/unit/:id', function (req, res) {

})
app.post('/api/unit', isAdminMiddleware, async function (req, res, next) {
    try {
        const unit = await db.Unit.create(req.body)
        res.status(201).json(unit);
    } catch (error) {
        next(error)
    }

})
app.put('/api/unit/:id', function (req, res) {

})
app.delete('/api/unit/:id', function (req, res) {

})


app.get('/api/category', async function (req, res) {
    try {
        const cats = await db.Category.findAll();
        res.status(200).json(cats);
    } catch (error) {
        next(error)
    }
})
app.post('/api/category', function (req, res) {

})
app.delete('/api/category/:id', function (req, res) {

})


app.get('/api/photo/:unit_id', function (req, res) {

})
app.post('/api/photo/:unit_id', function (req, res) {

})
app.delete('/api/photo/:id', function (req, res) {

})


app.post('/api/login', async function (req, res, next) {
    const body = req.body;
    try {
        const { username, password } = body;
        const admin = await db.Admin.findOne({ username });
        if (!admin) {
            throw new HttpError('AuthenticationFailure')
        }
        const passwordHash = await hasha.async(password, { algorithm: 'sha512' })

        if (admin.password !== passwordHash) {
            throw new HttpError('AuthenticationFailure')
        }
        const token = jsonwebtoken.sign({ username, id: admin.id }, process.env.JWT_KEY, {
            expiresIn: '24h'
        });
        res.status(200).json({
            username,
            token,
        })


    } catch (error) {
        next(error)
    }
})

app.use((err, req, res, next) => {
    if (err) {
        if (err instanceof HttpError) {
            return res.status(400).json({
                err
            })
        }
    }
    next(err, req, res)
})
module.exports = app
/**
 * -----UNIT SERVICE------
 * GET  api/unit
 * GET  api/unit/:id
 * POST api/unit
 * PUT  api/unit/:id
 * DELETE  api/unit/:id
 *
 *
 * -----CATEGORY SERVICE----
 * GET api/category
 * POST api/category
 * DELETE api/category/:id
 *
 *
 * -----PHOTO SERVICE----
 * GET api/photo/:unit_id
 * POST api/photo/:unit_id
 * DELETE api/photo/:id
 *
 * -----LOGIN-----
 * POST login api/login
 *
 */