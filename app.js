const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const jwt = require('jsonwebtoken');


const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const Sequelize = require('sequelize');

// utility folder to initialise database
const sequelize = new Sequelize(process.env.DB, process.env.DB_USER , process.env.DB_PASSWORD , {
    dialect: 'mysql',
    host: process.env.DB_HOST
});

module.exports = sequelize;

// Models folder to define Employee Model
const Employee = sequelize.define('employee', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type:Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    contact: {
        type: Sequelize.STRING,
        allowNull: false
    },
    salary: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

//middleware for token authentication

const authenticateToken = (req, res, next) => {

    
    const token = req.header('authorization');
    try{
    const empId = Number(jwt.verify(token , process.env.TOKEN_SECRET));
    Employee.findByPk(empId)
    .then( (emp) => {
        req.employee = emp;
        next();
    })
    } catch(e) {
        res.json({success: false , message: 'Token validation failed, no Employee associated with this token found' , erro:e});
    }

}




//Controller Files

const getEmployees = async (_req, res, _next) => {
    try{
    const employeeList = await Employee.findAll();
    res.json({success: true , employeeList , message:'all employee list fetched'});
    } catch (e){
        res.json({success: false , message: 'Database fetching failed' , error: e})
    }
}

const getToken = async(req, res, next) =>{
    try{
        //console.log('Hi i am here' , req.body);
        const empId = req.body.id;
        const jwtToken = jwt.sign(empId, process.env.TOKEN_SECRET);
        
        res.json({message: 'Token Generated Successfully' , token:jwtToken});
    }catch(e){
        res.json({e , message: 'error occurred while generating token'});
    }
}


//Routes 
app.post('/getToken' , getToken);
app.get('/getemployees' , authenticateToken , getEmployees);


sequelize
//.sync({ alter: true })
.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })
