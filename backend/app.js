const express = require('express')
const app = express()
const db = require('./db');
const hasha = require('hasha');
const jsonwebtoken = require('jsonwebtoken')
const multer = require('multer')
const upload = multer()
const path = require('path');

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

app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'content-type, authorization'
    })
    next();
})
app.use(express.json());
const isAdminMiddleware = async (req, res, next) => {
    try {
        const token = req.query.token;
        if (!token) {
            throw new HttpError('UnAuthorized')
        }
        const obj = jsonwebtoken.verify(token, process.env.JWT_KEY,{ expiresIn: '1m'});
        next();
    } catch (error) {
        return res.status(401).json({});
    }

}
app.get('/api/unit', async function (req, res, next) {
    try {
        const units = await db.Unit.findAll()
        res.status(200).json(units)

    } catch (error) {
        next(error)
    }
})
app.get('/api/unit/:id', async function (req, res, next) {
    try {
        const unit = await db.Unit.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: db.Photo,
                attributes: ['id']
            }]
        })
        res.status(200).json(unit)
    } catch (error) {
        next(error)
    }
})
app.get('/api/unit/:id/photos', async function (req, res, next) {
    try {
        const photos = await db.Photo.findAll()
        res.status(200).json(photos)
    } catch (error) {
        next(error)
    }
})
app.post('/api/unit', isAdminMiddleware, async function (req, res, next) {
    try {
        if (req.body.geom) {
            req.body.geom.crs = { type: 'name', properties: { name: 'EPSG:4326' } }
        }
        const unit = await db.Unit.create(req.body)
        res.status(201).json(unit);
    } catch (error) {
        next(error)
    }

})
app.put('/api/unit/:id', isAdminMiddleware, async function (req, res, next) {
    try {
        if (req.body.geom) {
            req.body.geom.crs = { type: 'name', properties: { name: 'EPSG:4326' } }
        }
        const unit = await db.Unit.findByPk(req.params.id)
        if (unit === null) {
            res.status(404).json({ message: 'Birim bulunamadı' })
            return;
        }
        unit.setAttributes(req.body)
        await unit.save();
        res.status(201).json(unit)
    } catch (error) {
        next(error)
    }
})
app.put('/api/unit/:id/geom', isAdminMiddleware, async function (req, res, next) {
    try {
        if (req.body.geom) {
            req.body.geom.crs = { type: 'name', properties: { name: 'EPSG:4326' } }
        }
        const unit = await db.Unit.findByPk(req.params.id)
        if (unit === null) {
            res.status(404).json({ message: 'Birim bulunamadı' })
            return;
        }
        unit.geom = req.body.geom;
        await unit.save();
        res.status(201).json(unit)
    } catch (error) {
        next(error)
    }
})
app.delete('/api/unit/:id',isAdminMiddleware, async function (req, res, next) {
    try {
        const id = req.params.id
        const unit = await db.Unit.findByPk(id)
        if (unit === null) {
            res.status(404).json({ unit: unit, message: 'Birim bulunamadı' })
            return;
        }
        await unit.destroy();
        // const unit = await db.Unit.destroy({
        //     where: {id: req.params.id}
        // })
        res.status(201).json(unit)
    } catch (error) {
        next(error)
    }
})


app.get('/api/category', async function (req, res, next) {
    try {
        const cats = await db.Category.findAll();
        res.status(200).json(cats);
    } catch (error) {
        next(error)
    }
})
app.post('/api/category',isAdminMiddleware, async function (req, res, next) {
    try {
        const category = await db.Category.create(req.body);
        if(!category) {
            throw new Error('Kategori oluşturulamadı.')
        }
        res.status(200).json(category);
    } catch (error) {
        next(error)
    }
})
app.delete('/api/category/:id', isAdminMiddleware, async function (req, res, next) {

})


app.get('/api/photo/:id', async function (req, res, next) {
    try {
        const photo = await db.Photo.findByPk(req.params.id)
        if (!photo) {
            throw new Error('photo bulunamadı')
        }
        // res.set('content-type', 'image');
        // photo.data;
        res.write(photo.data);
        res.end();
    } catch (error) {
        next(error)
    }
})
app.post('/api/photo/:unit_id',isAdminMiddleware, upload.single('photo'), async function (req, res, next) {
    try {
        const unitId = req.params.unit_id;
        const unit = await db.Unit.findByPk(unitId)
        if (!unit) {
            throw new Error('Birim bulunamadı')
        }
        // console.log(req.file);
        const photo = await db.Photo.create({
            unit_id: unit.id,
            data: req.file.buffer
        });

        // const photo = await db.Photo.create(req.body)
        res.status(201).json({
            id: photo.id
        });
    } catch (error) {
        console.log('HATA', error);
        next(error);
    }
})
app.delete('/api/photo/:id',isAdminMiddleware,async function (req, res, next) {
    try {
        const photoId = req.params.id
        const photo = await db.Photo.findByPk(photoId)
        if(!photo) {
            throw new Error('Fotoğraf bulunamadı')
        }
        await photo.destroy();
        res.status(201).json({
            message: 'Silme işlemi başarılı'
        });
    } catch (error) {
        next(error)
    }
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
// console.log(path.resolve(__dirname, '..', 'frontend','dist','frontend'));
app.use(express.static(path.resolve(__dirname, '..', 'frontend','dist','frontend')))
app.user((req, res, next) => {
    res.render(path.resolve(__dirname, '..', 'frontend','dist','frontend', 'index.html'))
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