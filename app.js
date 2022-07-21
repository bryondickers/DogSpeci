//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const multer  = require('multer');
const {GridFsStorage} = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const fs = require('fs')
const path = require("path");


const SpeciesIntro = " There is enormous variety in the way a dog acts and reacts to the world around them. Those differences can be due to how much socialization and handling they received as a youngster, how well the owner trained them after taking them home, and of course the genetic luck of the draw. In the end, your dog's preferences and personality are as individual as you are and if you can accept that, you're bound to enjoy each other's companionship for life.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//connect to DB


mongoose.connect(process.env.DB_URL);

//define a schema of img
const postSchema = new mongoose.Schema({
    postTitle: String,
    img:{
        data: Buffer,
        contentType: String},
    postBody:String 
})
const postModel = mongoose.model("Post",postSchema);

app.get("/",function (req,res) {

    res.render("home");
        
        }

  )


app.get("/species",function (req,res) {

    postModel.find(function (err, foundItems) { 
        if (err) {
            console.log(err);
        } else {
    
            res.render("species",{speciesIntroPara:SpeciesIntro,posts:foundItems});
        }

     })

      
})

app.get("/about",function (req,res) {
    res.render("about",{aboutParagraph:aboutContent});
});

app.get("/contact",function (req,res) {
    res.render("contact",{contactParagaph : contactContent});
});

app.get("/compose",function (req,res) {

    res.render("compose");

    
});
app.get("/post/:addPost/",function (req,res) {

    var postNa = req.params.addPost;

    postModel.find(function (err,titleArr) { 

        if (err) {
            console.log(err);
        } else {
            titleArr.forEach(function(title){
                if (_.lowerCase(postNa) === _.lowerCase(title.postTitle)){

                    res.render("post",{titlePost:title.postTitle,imagePosted:title.img,contentPost:title.postBody} );
                }

              })
            
            
        }

     })

})

// define storage for files
const Storage = multer.diskStorage({


    destination:function (req,file,cb) {
        cb(null, "uploads");
      },
    filename:function (req,file,cb){
        cb(null,file.fieldname );
    }  
})
//filter to allow only image files
const filterFile = function (req,file,cb) {

    if(file.mimetype.split("/")[0] === "image"){
           cb(null,true);
       }else{
           cb(null,false);
          
           console.log("choose correct file");
       }
    }



   
//define the middleware
const upload = multer({storage:Storage,fileFilter:filterFile});

app.post("/compose",upload.single("filename"),function (req,res) {


    const addPost = new postModel({
        postTitle: req.body.titleText,
        img:{
            data: fs.readFileSync(path.join("uploads/" + req.file.filename)),
            contentType: "image/png"
        },
        postBody: req.body.postContent
    })


    addPost.save(function(err){
        if (err){
            console.log(err);
        }else{
            console.log("Db successfully updated ");
        }

        res.redirect("/species");
    
    })

   

})

















app.listen(3000, function() {
  console.log("Server started on port 3000");
});
