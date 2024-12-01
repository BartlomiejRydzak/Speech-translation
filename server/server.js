import express from "express";
import bodyParser from "body-parser";
import multer from 'multer';
import fs from "fs";
import cors from "cors";

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname)
      },
      destination: function (req, file, cb) {
        cb(null, './uploads')
      },
})

const app = express();
const port = 5050;
const upload = multer({storage});

app.use(bodyParser.json());
app.use(cors());

let text;

import { spawn } from 'child_process';

function runPythonScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const pyProg = spawn("python3", [scriptPath].concat(args));

    let data = ""; // To collect standard output
    let errorData = ""; // To collect standard error

    // Collect data from stdout
    pyProg.stdout.on("data", (stdout) => {
      data += stdout.toString();
    });

    // Collect error messages from stderr
    pyProg.stderr.on("data", (stderr) => {
      errorData += stderr.toString();
      console.error(`stderr: ${stderr}`);
    });

    // Handle the close event
    pyProg.on("close", (code) => {
      if (code === 0) {
        resolve(data); // Resolve with stdout if the script ran successfully
      } else {
        reject(new Error(`Python script exited with code ${code}: ${errorData}`)); // Reject with error details
      }
    });

    // Handle process errors
    pyProg.on("error", (err) => {
      reject(err);
    });
  });
}


app.get("/audio", (req,res)=>{
    fs.readFile('./uploads/blob', {encoding: 'base64'}, (err, data) => {
        if(err) {
            res.status(500).send('Could not retrieve response');
        } else {
            res.status(200).send(data);
        }
    });
});

app.post("/upload", upload.any('file'), async (req, res) => {
    try {
      const result = await runPythonScript('../python_micro_env/main.py', [req.body.key]);
      // console.log(result); // Logs the resolved output of the Python script
      // console.log()
      // console.log("Completed");
      res.status(200).send("Updated");
    } catch (error) {
      console.error(error); // Handles any error that occurs while running the Python script
    }
  });

app.get("/api", (req, res)=>{
    res.json({ "users": ["userOne", "userTwo", "userThree"]});
})

app.post("/audio-text", (req,res) => {
    text = req.body.text;
    console.log(`posted ${text}`)
    res.status(200).send("Successfully received data");
})

app.get("/text", (req, res) => {
    console.log(`getting text:${text}`)
    res.json({'text': text});
})
app.listen(port, (res, req) => {
    console.log(`App listening on port ${port}`);
    
})