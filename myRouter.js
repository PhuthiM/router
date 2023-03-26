//จัดการ Routing

const express = require('express')
const router = express.Router()
let bodyParser = require('body-parser');
let mysql = require('mysql');
const path = require('path')
const http = require('http');

const createTime = require('../dist/3createTime_in.js')
const readAssetByID = require('../dist/4readAssetByID')
const trans = require('../dist/5transferTime_out.js');
const { json } = require('stream/consumers');

const indexPage = path.join(__dirname, '../dist/attendance.html')
const report = path.join(__dirname, '../dist/menu_Report.html')
const menuHome = path.join(__dirname, '../dist/first.html')
const create_in = path.join(__dirname, '../dist/create_in.ejs')
const insert = path.join(__dirname, '../dist/insertTimein.ejs')
const url = 'http://192.168.2.1:3000/employee1';

router.use(express.json())
router.use(express.urlencoded({ extended: true }))
router.use(express.static('dist'));

router.get('/', (req, res) => {
    res.status(200);
    res.type('text/html');
    res.sendFile(indexPage);
});

function getdata(url, id, callback) {
    let resultString = ""
    http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            const data1 = JSON.parse(data).data;
            for (i = 0; i < data1.length; i++) {
                if (data1[i].EmployeeID == id) {
                    check = true;
                    resultString = data1[i].Name;
                    break;
                }
            }
            callback(resultString);
        })
    }).on("error", (err) => {
        console.log("Error 52")
    });
}
router.post('/time', (req, res) => {
    const id = req.body.EmployeeID
    let ms = ""
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear().toString();
    const hour = currentDate.getHours().toString().padStart(2, '0');
    const minute = currentDate.getMinutes().toString().padStart(2, '0');
    const second = currentDate.getSeconds().toString().padStart(2, '0');
    const Time = `${day}/${month}/${year} - ${hour}:${minute}:${second}`;
    const url = 'http://192.168.2.1:3000/employee1';
    getdata(url, id, (strname) => {
        // console.log(data)
        // console.log("***********")
        if (strname.length !== 0) {
            if (req.body.button1 === 'submit1') {

                createTime.CreateAsset(id, strname)
                    .then((data) => {
                        dbCon.query('INSERT INTO report (EmployeeId, Name, Time_in, Time_out) VALUES (?,?,?,?)', [id, strname, Time, "-"], (error, results, fields) => {
                            if (error) throw error;
                            console.log("Insert report Success")
                        })
                        const n = JSON.stringify(data);
                        ms = "Success, Time In " + n;
                        console.log(ms);
                        res.render(insert, { name: ms });
                    })
                    .catch((err) => {
                        console.log('Error Time In');
                        ms = 'Error Time In';
                        res.render(insert, { name: ms });
                    });
            }
            else if (req.body.button2 === 'submit2') {
                trans.transferAssetAsync(id)
                    .then((data) => {
                        dbCon.query(`UPDATE report SET Time_out = ${Time}  WHERE EmployeeId = ${id}`, (error) => {
                            if (error) throw error;
                            console.log("UPDATE report  Success")
                        })
                        const n = JSON.stringify(data);
                        ms = "Success, Time Out " + n;
                        res.render(insert, { name: ms });
                    })
                    .catch((err) => {
                        console.log('Error Time Out');
                        ms = 'Error Time Out';
                        res.render(insert, { name: ms });
                    });
            } else {
                ms = "error"
                res.render(insert, { name: ms });
            }
        } else {
            ms = "error"
            res.render(insert, { name: ms });
        }


    });

});


let dbCon = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_report'
});
dbCon.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL successfully!')
});

router.get('/report', (req, res) => {
    dbCon.query('SELECT * FROM report', (error, results, fields) => {
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


router.get('/report', (req, res) => {
    res.status(200);
    res.type('text/html');
    // res.send('Success')
    res.sendFile(report);
});
module.exports = router