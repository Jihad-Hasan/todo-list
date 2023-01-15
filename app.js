//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-jihad:jihad123@cluster.wgwe6gg.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item",itemsSchema)

const item1 = new Item({
  name: "Welcome to your todo list"
});

const defaultItems = [item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });
  
  if (listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    });
  }
  
  });

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
})

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        console.log("Successfully deleted checked item.");

        res.redirect("/" + listName)
      }
    })
      
  }
  
})

app.get("/", function(req,res){
  Item.find({},function(err, foundItems){

    if(foundItems == 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
        }else{
          console.log("Deafult items successfully save to Database.")
        }
      });
     res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }); 
 
});

 let port = process.env.PORT;
 if (port == null || port == ""){
   port = 3000;
 }

 app.listen(port);

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
