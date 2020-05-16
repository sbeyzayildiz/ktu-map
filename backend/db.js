const { Sequelize, Model, DataTypes } = require('sequelize');
//const sequelize = new Sequelize('sqlite::memory:');
const POSTGRES_HOST = process.env.POSTGRES_HOST
const POSTGRES_PORT = process.env.POSTGRES_PORT
const POSTGRES_USER = process.env.POSTGRES_USER
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
const POSTGRES_DB = process.env.POSTGRES_DB

const sequelize = new Sequelize(`postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`) // Example for postgres


class Unit extends Model { }
Unit.init({
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.STRING,
    telephone: DataTypes.STRING,
    website: DataTypes.STRING,
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    parent_unit_id: DataTypes.INTEGER,
    geom: {
        type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
        allowNull: false
    }
}, { sequelize });

class Photo extends Model { }
Photo.init({
    data: DataTypes.STRING,
    unit_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

}, { sequelize });

Photo.belongsTo(Unit, {
    foreignKey: 'unit_id'
})
class Category extends Model { }
Category.init({
    name: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
    },

}, { sequelize });

Unit.belongsTo(Category, {
    foreignKey: 'category_id'
})

class Admin extends Model { }
Admin.init({
    username: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING
    },
    display_name: DataTypes.STRING,
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: DataTypes.STRING
}, { sequelize })

const initSuperadmin = async () => {
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const user = await Admin.findOne({ where: { username: ADMIN_USERNAME } })
    if (!user) {
        return Admin.create({
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD
        })
    }

}

const initCategories = async () => {
    const defaultCategories = [
        { name: 'Kampüs' },
        { name: 'Fakülte' },
        { name: 'Dekanlık' },
        { name: 'Bölüm' },
        { name: 'Kütüphane' },
        { name: 'Park' },
        { name: 'Kongre Merkezi' },
        { name: 'Kantin' },
    ]
    const alreadyExistCategries = await Category.findAll()
    const notFoundCategories = defaultCategories.filter(def => {
        const dbHasThisOne = !!alreadyExistCategries.find(dbCat => dbCat.name === def.name);
        return !dbHasThisOne
    });
    for (const cat of notFoundCategories) {
        await Category.create(cat);
    }
}

module.exports = {
    Unit,
    Admin,
    Photo,
    Category,
    sequelize,
    initSuperadmin,
    initCategories,
}