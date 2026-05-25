import AuthService from "@src/services/auth/authService";
import { Pool } from "pg";

import AuthCRUD from "./authCRUD";

class AuthController {
  register: AuthCRUD["register"];
  login: AuthCRUD["login"];
  refresh: AuthCRUD["refresh"];
  logout: AuthCRUD["logout"];
  forgotPassword: AuthCRUD["forgotPassword"];
  resetPassword: AuthCRUD["resetPassword"];

  constructor(db: Pool) {
    const authService = new AuthService(db);
    const authCRUD = new AuthCRUD(authService);

    this.register = authCRUD.register.bind(authCRUD);
    this.login = authCRUD.login.bind(authCRUD);
    this.refresh = authCRUD.refresh.bind(authCRUD);
    this.logout = authCRUD.logout.bind(authCRUD);
    this.forgotPassword = authCRUD.forgotPassword.bind(authCRUD);
    this.resetPassword = authCRUD.resetPassword.bind(authCRUD);
  }
}

export default AuthController;
