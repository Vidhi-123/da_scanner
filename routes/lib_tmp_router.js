var express=require('express');
var router=express.Router();
var tmp_lib=require('../model/lib_tmp');
var lib=require('../model/library');
const date = require('date-and-time');
var user=require('../model/User');
var loggedin = function (req,res,next)
{
    if(req.isAuthenticated())
    {
       
        user.find({_id : req.user._id},function(err,rows){
            if(err)
            {
                res.redirect('/');
            }
            else{
                if(rows[0].userTypeId==4)
                {
                    next() // if logged in
                }
                else{
                    res.redirect('/');
                }
            }
        })
       
    }
    else if(req.cookies['remember_me']){
		req.user = req.cookies['remember_me'];
		next();
	}            
	else
		res.redirect('/');
}



router.get('/lib_tmp_out',loggedin,function(req,res,next){
    
   
    tmp_lib.find(function(err,docs){
        if(err)
        {
           
            res.json(err);
        }
        else
        {
           
            //res.json(docs);
            
        
                var i;
                var id1;
                for(i=0;i<docs.length;i++)
                {
                    id1=docs[i].userId;
                tmp_lib.find({userId:id1},function(err,docs1){
                 
                    if(err)
                    {
                        res.json(err);
                    }// wait ek min
                    else
                    {
                        //res.json(docs);
                      
            
                        const now = new Date();
                        let curtime=date.format(now,'HH:mm:ss')
                        docs1[0].out_time=curtime;
                        //date:new Date(dat_obj.getFullYear(),dat_obj.getMonth(),dat_obj.getDate()+1)
                        
                        docs1[0].save(function(err1,res1){
                            if(err1)
                            {
                                res.json(err1);
                            }
                            else
                            {
                                //res.json(res1);
                                    const lib1=new lib({
                                    userId : docs1[0].userId,
                                    in_time :docs1[0].in_time,
                                    out_time:docs1[0].out_time,
                                    date:docs1[0].date
                                    
                                   
                                });
                             
                                lib1.save(function(err,result){
                                    if(err)
                                    {
                                        res.json(err);
                                    }
                                    else{
                                        //res.json(result);


                                       
                                        tmp_lib.deleteOne({userId:lib1.userId},function(err,result){
                                            if(err)
                                            {
                                                res.json(err);
                                            }
                                            else
                                            {
                                                //res.json(result);
                                               
                                                //res.redirect('/lib_tmp');
                                            }
                                        })
                                    







                                    }
                                });
                                



                            }
                        });
            
                    }
                });



            }
            
        }
       
     
        setTimeout(()=>{res.redirect('/lib_tmp')}, 1000); 
    });

   
});




router.get('/:id?',loggedin,function(req,res,next){
    if(req.params.id)
    {
    const id1=req.params.id;
    tmp_lib.find({userId:req.params.id},function(err,docs){
        if(err)
        {
          
            res.json(err);
        }
        else
        {
         
            //res.json(docs);
            if(docs.length==0){
                // res.json(docs);
             
                var x=Date.now();
                //x=Date.now();
            
                var dat_obj=new Date(x);
                var d1=new Date();
                var h=d1.getHours();
                var m=d1.getMinutes();
                var s=d1.getSeconds();
               
                const now=new Date();
                const tmp=new tmp_lib({
                    userId : id1,
                    //in_time : dat_obj.getTime(),
                    in_time:new String(h+":"+m+":"+s),
                    out_time:null,
                    //date:new Date(dat_obj.getFullYear(),dat_obj.getMonth(),dat_obj.getDate())
                    date: date.format(now, 'DD-MM-YYYY')
                
                });
               
                tmp.save(function(err,result){
                    if(err)
                    {
                        res.json(err);
                    }
                    else{
                        //res.json(result);
                        res.redirect('/lib_tmp');
                    }
                });
            }
            else{


                tmp_lib.find({userId:id1},function(err,docs1){
                   
                    if(err)
                    {
                        res.json(err);
                    }// wait ek min
                    else
                    {
                        //res.json(docs);
                       
            
                        const now = new Date();
                        let curtime=date.format(now,'HH:mm:ss')
                        let currDate = date.format(now, 'DD-MM-YYYY');
                       
                        docs1[0].out_time=curtime;
                        docs1[0].date=currDate;
                        //date:new Date(dat_obj.getFullYear(),dat_obj.getMonth(),dat_obj.getDate()+1)
                        
                        docs1[0].save(function(err1,res1){
                            if(err1)
                            {
                                res.json(err1);
                            }
                            else
                            {
                                //res.json(res1);
                                    const lib1=new lib({
                                    userId : docs1[0].userId,
                                    in_time :docs1[0].in_time,
                                    out_time:docs1[0].out_time,
                                    date:docs1[0].date
                                    
                                    
                                });
                               
                                lib1.save(function(err,result){
                                    if(err)
                                    {
                                        res.json(err);
                                    }
                                    else{
                                        //res.json(result);



                                        tmp_lib.deleteOne({userId:id1},function(err,result){
                                            if(err)
                                            {
                                                res.json(err);
                                            }
                                            else
                                            {
                                                //res.json(result);
                                                res.redirect('/lib_tmp');
                                            }
                                        })







                                    }
                                });
                                



                            }
                        });
            
                    }
                });



            }
        }
    });
}
else{
    tmp_lib.find(function(err,rows){
        if(err)
        {
            res.json(err);
        }
        else{
          
            let avl_seats=200-rows.length;
           
            //res.json(x);
            res.render('library_views/add_lib_tmp',{
                avl_seats:avl_seats,
                students:rows,
                errors:null
            })
        }
    })
}
});

router.post('/',function(req,res,next){
    var x=Date.now();
    //x=Date.now();
  
    var dat_obj=new Date(x);
    var d1=new Date();
    var h=d1.getHours();
    var m=d1.getMinutes();
    var s=d1.getSeconds();
   
    const tmp=new tmp_lib({
        userId : req.body.studentId,
        //in_time : dat_obj.getTime(),
        in_time:new String(h+":"+m+":"+s),
        out_time:null,
        date:new Date(dat_obj.getFullYear(),dat_obj.getMonth(),dat_obj.getDate())
    });
   
    tmp.save(function(err,result){
        if(err)
        {
            res.json(err);
        }
        else{
            //res.json(result);
            res.redirect('/lib_tmp');
        }
    });
})
router.put('/:id',function(req,res,next){
    tmp_lib.findById(req.params.id,function(err,docs){
     
        if(err)
        {
            res.json(err);
        }// wait ek min
        else
        {
            //res.json(docs);
        


            docs.out_time=Date.now(),
            //date:new Date(dat_obj.getFullYear(),dat_obj.getMonth(),dat_obj.getDate()+1)
            
            docs.save(function(err1,res1){
                if(err1)
                {
                    res.json(err1);
                }
                else
                {
                    res.json(res1);
                }
            });

        }
    });
});


router.delete('/:id',function(req,res,next){
    tmp_lib.deleteOne({_id:req.params.id},function(err,result){
        if(err)
        {
            res.json(err);
        }
        else
        {
            res.json(result);
        }
    })
});

// GENERATING REPORT FOR LIBRARY

router.post("/generateReport",loggedin,(request,response)=>{

	let option = request.body.reportOption;

	let today = new Date();
    let yyyy = today.getFullYear();

    today = new Date();
    let fdate  = new Date("2000-01-01");
	let startDate = date.format(fdate, 'DD-MM-YYYY');
	let endDate = date.format(today, 'DD-MM-YYYY');
	console.log(today);
	let startId = "200100000";
	let endId = "999999999";

	if(option == 2 || option == 3)
	{
		startId = request.body.studentId;
		endId = request.body.studentId;
	}

	if(option != 2)
	{
		let sdate  = new Date(request.body.startDate);
		let edate  = new Date(request.body.endDate);

		startDate = date.format(sdate, 'DD-MM-YYYY');
		endDate = date.format(edate, 'DD-MM-YYYY');

		if(startDate > endDate)
		{
			let tempDate = startDate;
			startDate = endDate;
			endDate = tempDate;
		}
	}

	console.log(startDate + " "+ endDate);
	console.log(startId + " "+ endId);
	startId = parseInt(startId, 10);
	endId = parseInt(endId, 10);
	// FOR DATA FROM BOTH TABLES
	let libRec = {};
	let tempRec = {};
	lib.aggregate(([
	{
		"$lookup":
		{
			"from": "users",
			"localField": "userId",
			"foreignField": "_id",
			"as": "libRecords"
		}
	},
	{
		"$unwind": "$libRecords"
	},
	{
		"$project":
		{
			"libRecords.password": 0
		}
	},
	{
		"$match":
		{
			"$and":
			[
				{"$or":[{"date": {"$lte": endDate}},
						//{"outDate": {"$lte": endDate}},
						{"date":{"$eq": ""}}]},
				{"$or":[{"date": {"$gte": startDate}},
						//{"inDate": {"$gte": startDate}},
						{"date":{"$eq": ""}}]},
				{"userId": {"$gte": startId}},
				{"userId": {"$lte": endId}}
			]
		}
	}
	]), (err, result)=>
	{
		if(err)
		{
			console.log("error while getting records for Report");
			console.log(err);
		}

		console.log(startDate, endDate);
		if(result.length !== 0)
		{
			/*response.render("reportViews/DisplayReport",
			{
				title: "Generated Report From Gate Reocrds",
				messages: result,
				startDate: startDate,
				endDate: endDate
			});*/
			libRec = result;
		}
		else
		{
			/*response.render("reportViews/DisplayReport",
			{
				title: "Generated Report From Gate Reocrds",
				messages: "No Data Found",
				startDate: startDate,
				endDate: endDate
			});*/
			libRec=undefined;
		}
	});

	// FROM CURRENT PENDING ENTRY TABLE 
	tmp_lib.aggregate(([
		{
			"$lookup":
			{
				"from": "users",
				"localField": "userId",
				"foreignField": "_id",
				"as": "libRecords"
			}
		},
		{
			"$unwind": "$libRecords"
		},
		{
			"$project":
			{
				"libRecords.password": 0
			}
		},
		{
			"$match":
			{
				"$and":
				[
					{"$or":[{"date": {"$lte": endDate}},
							//{"outDate": {"$lte": endDate}},
							{"date":{"$eq": ""}}]},
					{"$or":[{"date": {"$lte": endDate}},
							//{"inDate": {"$gte": startDate}},
							{"date":{"$eq": ""}}]},
					{"userId": {"$gte": startId}},
					{"userId": {"$lte": endId}}
				]
			}
		}
		]), (err, result)=>
		{
			if(err)
			{
				console.log("error while getting records for Report");
				console.log(err);
			}
	
			console.log(startDate, endDate);
			if(result.length !== 0)
			{
				console.log(result);
				response.render("reportViews/DisplayLIBReport",
				{
					title: "Generated Report From Gate Reocrds",
					tempRec: result,
					libRec: libRec,
					startDate: startDate,
					endDate: endDate
				});
				
			}
			else
			{
				setTimeout(()=>{
				response.render("reportViews/DisplayLIBReport",
				{
					title: "Generated Report From Gate Reocrds",
					tempRec: null,
					libRec: libRec,
					startDate: startDate,
					endDate: endDate
                });
            },1000);
				//tempRec=undefined;
			}
		});

})

module.exports=router
