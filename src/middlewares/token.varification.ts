import ConfigService from "./../services/service.config";

const config = ConfigService.getInstance().getConfig();

class JwtAuthentication {
  private static jwtAuth: JwtAuthentication;
  private constructor() {}

  static getInstance() {
    if (!JwtAuthentication.jwtAuth) {
      JwtAuthentication.jwtAuth = new JwtAuthentication();
    }
    return JwtAuthentication.jwtAuth;
  }

  public async authenticateUser(req: any, res: any, next: any) {
    const providedAccessKey = req.headers.access_key;
    // Define the valid access key
    const VALID_ACCESS_KEY = config.ACCESS_KEY;

    if (!providedAccessKey || providedAccessKey !== VALID_ACCESS_KEY) {
      return res.status(403).json({ status: 403, error: "Access denied." });
    }

    next();
  }
}


export = JwtAuthentication;