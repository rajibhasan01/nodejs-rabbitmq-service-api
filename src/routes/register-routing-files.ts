// External import
import express from "express";

// Internal import
import publisherRoute from "./publisher/route.publisher";

// Create a new router object
const registeredRouters = express.Router();

registeredRouters.use("/", publisherRoute);

export = registeredRouters;