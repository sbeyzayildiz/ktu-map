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
    geom: DataTypes.GEOMETRY
}, { sequelize });

class Photo extends Model { }
Photo.init({
    data: DataTypes.STRING,
    unit_id: DataTypes.INTEGER,

}, { sequelize });

Photo.belongsTo(Unit, {
    foreignKey: 'unit_id'
})
class Category extends Model { }
Category.init({
    name: {
        allowNull: false,
        type: DataTypes.STRING
    },

}, { sequelize });

// Category.belongsTo(Unit, {
//     foreignKey: 'category_id'
// })
Unit.belongsTo(Category, {
    foreignKey: 'category_id'
})

class Admin extends Model { }
Admin.init({
    username: { allowNull: false, unique: true, type: DataTypes.STRING },
    display_name: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING
}, { sequelize })



module.exports = {
    Unit,
    Admin,
    Photo,
    Category,
    sequelize
}