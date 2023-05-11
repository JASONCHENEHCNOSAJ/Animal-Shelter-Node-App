const http = require("http");
const path = require("path");
const bodyParser = require("body-parser"); /* To handle post parameters */
const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */

/* directory where templates will reside */


require("dotenv").config() 

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const database = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;


if (process.argv.length != 3) {
    process.stdout.write(`Invalid Number of Arguments\n`);
    process.stdout.write(`Please follow the following format:  node AnimalShelterServer.js PORT_NUMBER_HERE`);
    process.exit(1);
  }
  
  process.stdin.setEncoding("utf8"); /* encoding */
  
  
  const portNumber = process.argv[2];

  app.listen(portNumber);
  console.log(`Web server started and running at http://localhost:${portNumber}`);
  const prompt = "Stop to shutdown the server: ";

  process.stdout.write(prompt);
  process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
  
      let dataInput = process.stdin.read();
      if (dataInput !== null) {
  
  
          let command = dataInput.trim();
          if (command === "Stop") {
              process.stdout.write("Shutting down the server\n");
              process.exit(0);  /* exiting */
          } else {
              /* After invalid command, we cannot type anything else */
              process.stdout.write(`Invalid command: ${command}\n`);
          }
  
  
      process.stdout.write(prompt);
      process.stdin.resume();
      }
  
  });

  



const databaseAndCollection = {db: database, collection:collection};
const { MongoClient, ServerApiVersion } = require('mongodb');
const { CONNREFUSED } = require("dns");
const { url } = require("inspector");
  
  async function insert(name,gender,age,species,background) {
   
    const uri = `mongodb+srv://${userName}:${password}@cluster0.qwck4jb.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
     
      


        let pet = {name: name, gender: gender, age: age, species: species, background: background};
        await insertPet(client, databaseAndCollection, pet);


    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function insertPet(client, databaseAndCollection, newPet) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newPet);
}



async function deletePet(name,gender,pets,age) {

    const uri = `mongodb+srv://${userName}:${password}@cluster0.qwck4jb.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
        let targetName = name;
        let targetGender = gender;
        let targetSpecies = pets;
        let targetAge = age;
        return await deletePetH(client, databaseAndCollection, targetName, targetGender, targetSpecies, targetAge);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function deletePetH(client, databaseAndCollection, targetName, targetGender, targetSpecies, targetAge) {
    let filter = {name: targetName, gender: targetGender, age: targetAge, species: targetSpecies};

    const result = await client.db(databaseAndCollection.db)
                   .collection(databaseAndCollection.collection)
                   .deleteOne(filter);
   
     console.log(`Documents deleted ${result.deletedCount}`);
     return (result.deletedCount);
}

async function getJSONData() {
    let response = await fetch("https://www.boredapi.com/api/activity");
    let json = await response.json();
    return json.activity.toLowerCase();

  }


  async function listAll() {
   
    const uri = `mongodb+srv://${userName}:${password}@cluster0.qwck4jb.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

   
    try {
        await client.connect();
                
                console.log("***** Looking up many *****");
                return await lookUp(client, databaseAndCollection);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function lookUp(client, databaseAndCollection) {

    let filter = {};   

    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);

    const result = await cursor.toArray();
   return result;
}




// view engine setup
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

// app configuration
app.use(express.static(path.join(__dirname,'public')))

app.use(bodyParser.urlencoded({extended:false}));
  






app.get("/", (request, response) => {
    /* Generating the HTML using welcome template */
    response.render("index");
    
  });

  app.get("/adopt", (request, response) => {

 const variables = {
        port: portNumber
      };

      response.render("adopt", variables);
  

      
  });


  app.post("/processadopt", async (request, response) => {


    let {name, gender, pets, age} = request.body; 
     let num = await deletePet(name,gender,pets,age);

     if (num == 0) {

        response.render("processadoptF");
     } else {
let activity = await getJSONData();

const variables = { 
                       name: name,
                       activity: activity
                     };

      response.render("processadoptS", variables);
                    }
  });


  app.get("/find", (request, response) => {
    const variables = {
        port: portNumber
      };

      response.render("find", variables);
  
  });

  app.post("/processSurrenderApplication", async (request, response) => {

    let {name, gender, pets, age, background} = request.body;

    insert(name,gender,age,pets,background);
   
const variables = { 
                       name: name,
                       gender : gender,
                       pets: pets,
                       age: age,
                       background: background
                     };

      response.render("processfind", variables);
  });

  app.get("/view", async (request, response) => {


    let info = await listAll();
 
    let table = "<table border = 1> <tr> <th> Name </th> <th> Species </th> <th> Age </th> <th> Gender </th> </tr>"

    for (let animal of info) {
        table += "<tr> <td>" + animal.name + "</td> <td>" + animal.species + "</td> <td>" + animal.age + "</td> <td>" + animal.gender + "</td></tr>"
      }

      table += "</table>"

const variables = { 
                       table: table
                     };

      response.render("view", variables);
  });




