// External import
import express from "express";

import upload  from "./../../middlewares/fileUpload";
import JwtAuthentication from "./../../middlewares/token.varification";
import PublisherController from "./../../controllers/controller.publisher";

const authentication = JwtAuthentication.getInstance().authenticateUser;
const controller = PublisherController.getInstance();

const publisherRoute = express.Router();

publisherRoute.get("/isalive", controller.healthCheck);

publisherRoute.post("/create-cartoon", authentication, upload.single('image'), controller.CreateCartoon);

export = publisherRoute;

