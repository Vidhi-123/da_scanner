const express = require("express");
const bcrypt=require('bcrypt');

//bring user type model
const UserTypes = require("../model/UserTypes"); 
// bring user model
const User = require("../model/User");
const date = require("date-and-time");
const Course = require("../model/Batch");
const qr = require('../model/qrcode');
const library = require('../model/lib_tmp');
var inventory = require('../model/sportsinventory_model');
const userRouter = express.Router();

var loggedin = function (req,res,next)
{
	if(req.isAuthenticated()){
		next() // if logged in
	}
	else if(req.cookies['remember_me']){
		console.log(req.cookies['remember_me']);
		req.user = req.cookies['remember_me'];
		next();
	}
	else{
		//console.log("looping....");
		res.redirect('/');
	}
}


userRouter.get("/",loggedin,(req,res)=>{

	let libRecords;
	library.find((err,libdata)=>{
		if(err){
			res.status(500).send("Error loading DB");
		}
		else{
			libRecords=200-libdata.length;
		}
	})
	let inventoryRecords;
	inventory.find(function (err, inventoryrecord) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            inventoryRecords=inventoryrecord;
        }
	});
	let user = req.user;
	
	setTimeout(()=>{
        res.render("adminViews/adminHome",{
			title: user.fName + " " + user.lName,
			avl_seats: libRecords,
			inventoryData: inventoryRecords,
			err: ""
		})
    },1000)
	

})


// ADD A COURSE TO THE DATABASE

userRouter.post("/addCourse",(req,res) =>{

		let cid = req.body.courseID;
		let courseName = req.body.courseName;
		let dur = req.body.duration;
		//console.log(cid + dur);
		Course.findById(cid , (err,doc)=>{

			if(err)
			{
				res.status(500).send("Unexpeected error occured");
				console.log("err " +err);
			}
			else if(doc)
			{
				res.status(500).send("Course Already Exists");
				console.log(doc);
			}
			else{

				let course = new Course();

				course._id = cid;
				course.course_name = courseName;
				course.duration=dur;

				course.save().then( result=>{

					//console.log(result);
					res.send("Course Added");
				})
				.catch(err=>{
					res.status(500).send("Database Error ");
					//console.log(err);
				})
				
			}
		})


})

// LOADING GENERATE REPORT FORM
userRouter.get("/loadGenerateReport",loggedin,(request, response)=>
{
	let user = request.user;
	let route="";
	if(user.userTypeId==1){
		route="admin";
	}
	else if(user.userTypeId==2)
	{
		route="gate";
	}
	// TODO SAC AND LIB
	response.render("GenerateReportForm",
	{
		title: "Generate Report from gate reocrds",
		route: route,
		messages: null
	});
});

userRouter.post("/generateReport",(request,response)=>{
   
	let option=request.body.empType;
	console.log(option);
	request.url="/"+option+"/generateReport";
	//next("/"+option+"/generateReport");
	request.app.handle(request,response); //WORKS

});


userRouter.get("/addEmpUser", (request, response, next) =>
{
	
	UserTypes.find({}, (error, userTypes)=>
	{
		if(error)
		{
			console.log(error);
		}
		else
		{
			//console.log(userTypes);
			response.render("adminViews/EmployeeRegistration",
			{
				title: "Employee Registration",
				userTypes: userTypes,
				data: "",
				errors: null
			});
		}
	});
		
	
});




userRouter.post("/addEmpUser", async (request, response, next) => 
{
		User.findOne({userEmailId:request.body.userEmailId},async (err,doc)=>{
		if(err){
				response.status(500).send('Error occured');

		}
		else if(doc)
		{
				response.status(500).send(' User already exists');

		}
		else{
				try{
				const hashedPass = await bcrypt.hash(request.body.password,10); //await as async 
		
					console.log(hashedPass);
					let user = new User();
					user._id = request.body.userId;
					user.userEmailId = request.body.userEmailId;
					user.fName = request.body.fName;
					user.lName = request.body.lName;
					user.userTypeId = request.body.userTypeId;
					//not in emp registration
						//user.courseName = request.body.courseName;
						//user.batchYear = request.body.batchYear;
					user.password = hashedPass;

					user.save()
					.then(result=>
					{
						//console.log(result);
						qr.emailEmployee(request.body.userEmailId,request.body.password);
						response.redirect("/admin/loadAllEmpUsers"); //redirect to all emps
					})
					.catch(err=>
					{
						response.redirect("/admin/addEmpUser"); //redirect to register 
					});
				}catch{
					response.redirect("/admin/addEmpUser");
				}

			}
		});

	//}
});

// DISPLAY STUDENTS INFO
userRouter.get("/loadAllStudents",(req,res)=>{
	User.find({userTypeId: {$eq:5}}, (error, students)=>
	{
		if(error)
		{
			console.log(error);
		}
		else
		{
			
			res.render("adminViews/DisplayAllStudents",
			{
				title: "Showing all Students",
				users: students,
				errors: null
			});
		}
	});
})

// RESET STUDENT'S QR COUNT
userRouter.post("/resetStudent/:stuid",(req,res)=>{

	let id = req.params.stuid;
	let id1=id;
	id1=id1.toString();
	id1=id1+Date.now();
	//user.qr_code = id1;
	User.findByIdAndUpdate({_id:id},{$set: {qr_cnt: 5 ,qr_code:id1 }},{new:false}, (err,user)=>{
		if(err){
			res.status(500).send("Error updating Info");
		}
		else{
				let err = qr.generateQR(id,id1,(flag)=>{

					if(flag)
					{
						res.send("QR RESET DONE");
					}
					else{
						res.status(500).send("ERROR RESETTING QR");
					}
				});
				
		}
	})

})




userRouter.get("/loadAllEmpUsers", (request, response, next) =>
{
	User.find({userTypeId: {$ne:5}}, (error, emps)=>
	{
		if(error)
		{
			console.log(error);
		}
		else
		{
			
			response.render("adminViews/DisplayAllEmp",
			{
				title: "Showing all Employees",
				users: emps,
				errors: null
			});
		}
	});
});

userRouter.delete("/delEmp/:userId", (request, response, next)=>
{
	const userId = request.params.userId;
	User.deleteOne({_id: userId})
	.exec()
	.then((result)=>
	{
		response.redirect("/users/loadAllEmpUsers");
	})
	.catch((err)=>
	{
		console.log(err);
		response.redirect("/users/loadAllEmpUsers");
	});
});
module.exports = userRouter;