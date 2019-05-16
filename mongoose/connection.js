//require mongoose module
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
const { userModel } = require('../models/userModel');
const crypto = require('crypto');

const logger = require('log4js').getLogger("mongoose");

//export this function and imported by server.js
module.exports = function () {

    const secret = 'machine';

    const hash = crypto.createHmac('sha256', secret)
        .update('admin')
        .digest('hex');

    mongoose
        .connect('mongodb://127.0.0.1:27017/machine', { useNewUrlParser: true })
        .then(async () => {
            let result = await userModel.findOneAndUpdate(
                { username: 'admin', password: hash, type: 'master' },
                {},
                { upsert: true }
            ).exec();
            console.log(result)
        })

    // if (!config["mongodb.user"]) {
    // mongoose.connect(config["mongodb.dbURL"], { useNewUrlParser: true });
    // } else {
    //     mongoose.connect(config["mongodb.dbURL"], { auth: { authdb: "admin" }, user: config["mongodb.user"], pass: config["mongodb.password"], useNewUrlParser: true });
    // }

    autoIncrement.initialize(mongoose.connection);

    mongoose.connection.on('connected', function () {
        logger.info("Mongoose default connection is open to ");
    });

    mongoose.connection.on('error', function (err) {
        logger.info("Mongoose default connection has occured " + err + " error ");
    });

    mongoose.connection.on('disconnected', function () {
        logger.info("Mongoose default connection is disconnected");
    });

    // process.on('SIGINT', function () {
    //     mongoose.connection.close(function () {
    //         logger.info(termination("Mongoose default connection is disconnected due to application termination"));
    //         process.exit(0)
    //     });
    // });
}