//จัดการ Routing
const express = require('express')
const router = express.Router()




const path = require('path')
const show = require('../dist/2getAllAssets');
const create = require('../dist/3createAsset.js');

let bodyParser = require('body-parser');
let mysql = require('mysql');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))


let dbCon = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_emp'
});
dbCon.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL successfully!')
});

router.get('/employee1', (req, res) => {
   dbCon.query('SELECT * FROM employee', (error, results, fields) => {
        if (error) throw error;
        // console.log(results);
        let message = "successfully"
        if (results.length == 0) {
            message = "Employee empty";
        } else {
            message = "successfully ";
        }
        return res.send({
            data: results
        });
   })
})


const menuHome = path.join(__dirname, '../dist/menu_Home.html')
// const menuEmpAll = path.join(__dirname, '../dist/menu_EmpAll.html')
const menuEmpAdd = path.join(__dirname, '../dist/menu_EmpAdd.html')
const menuReport = path.join(__dirname, '../dist/menu_Report.html')
const insert = path.join(__dirname, '../dist/insertdata.ejs')
const empall = path.join(__dirname, '../dist/getall.ejs')

router.use(express.json())
router.use(express.urlencoded({ extended: true }))
router.use(express.static('dist'));


router.get('/', (req, res) => {
    res.status(200);
    res.type('text/html');
    res.sendFile(menuHome);
});

router.get('/menu_EmpAll', (req, res) => {
    show.getAllAssets()
        .then((data) => {
            // let resultString = JSON.stringify(data);
            // console.log('***********************')
            // console.log(data);
            res.render(empall, { users: data });
        })
    // res.sendFile(menuEmpAll);
});

router.get('/menu_EmpAdd', (req, res) => {
    res.sendFile(menuEmpAdd);
});

router.post('/menu_EmpAdd/3createAsset', (req, res) => {

    const Empid = req.body.EmployeeID
    const name = req.body.Name
    const sex = req.body.Sex
    const age = req.body.Age
    const start_date = req.body.Start_Date
    const position = req.body.Position
    dbCon.query('INSERT INTO employee (EmployeeID, Name, Gender, Age, Start_date, Position) VALUES (?,?,?,?,?,?)', [Empid, name, sex, age, start_date, position], (error, results, fields) => {
        if (error) throw error;
        console.log("Insert Success")
    })
    create.createAsset(Empid, name, sex, age, start_date, position)
        .then((data) => {
            let resultString = JSON.stringify(data);
            console.log(resultString);
            // console.log(typeof (resultString))

            const name = "Succes, Insertdata " + resultString;
            res.render(insert, { name: name });

        })
        .catch((error) => {
            console.log('error')
            const name = "Error, Insertdata !";
            res.render(insert, { name: name });
        })

});


router.get('/menu_Report', (req, res) => {
    res.sendFile(menuReport);
});



module.exports = router