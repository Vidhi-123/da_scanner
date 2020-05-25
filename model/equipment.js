const mongoose = require('mongoose');

var Schema = mongoose.Schema;

let equipmentBorrows = new Schema({

    equipment_id : {type:mongoose.Schema.ObjectId,ref:"inventorytb"},
    student_id : {type:String},
    issue_date : {type:String},
    quantity:{type:Number}

});

module.exports = mongoose.model("equipment_borrows", equipmentBorrows);

