const { Sequelize, Model, DataTypes } = require('sequelize');
//const sequelize = new Sequelize('sqlite::memory:');
const sequelize = new Sequelize('postgres://postgres:patates_agaci@feyz.cf:9876/postgres') // Example for postgres

class Unit extends Model { }
Unit.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    telephone: DataTypes.STRING,
    website: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
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
    name: DataTypes.STRING,

}, { sequelize });

Category.belongsTo(Unit, {
    foreignKey: 'category_id'
})

class Admin extends Model { }
Admin.init({
    username: { allowNull: false, unique: true, type: DataTypes.STRING },
    display_name: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING
}, { sequelize })


sequelize.sync({force: true})
    .then(
        () => {
            console.log('sync calistiii!!!')
        }
    )
module.exports = {
    Unit,
    Admin,
    Photo,
    Category,
    sequelize
}