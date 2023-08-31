// External imports
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as child from 'child_process';

// Internal imports
import registeredRouters from "./routes/register-routing-files";

const app = express();
const port = process.env.PORT || 5000; // Default port to listen
// Define a route handler for the default home page
app.use(express.json({limit: '50mb'})); // Support json encoded bodies upto 50 mb
app.use(express.urlencoded({ extended: true, limit: '50mb'})); // Support encoded bodies
app.use(cors());
dotenv.config();

// Routing setup
app.use('/', registeredRouters);

// Start the Express server
app.listen(port, ()=> {
    // tslint: disable-next-line:no-console
    console.log(`Server started at http://localhost:${port}`);
});

const consumerProcess = child.spawn('node', ['./dist/src/consumer/consumer.js'], { stdio: 'inherit' });

// Listen for the 'exit' event on the main process
process.on('exit', () => {
    // Terminate the child process when the main process exits
    consumerProcess.kill();
});