const passport = require("passport");

class SessionsService {
  async register(req) {
    return { status: "success", message: "User Registered" };
  }

  async failRegister() {
    console.log("falló la estrategia");
    return { error: "Register failed" };
  }

  async login(req) {
    if (!req.user) {
      return { status: "error", error: "credenciales invalidas" };
    }

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      cart_id: req.user.cart_id,
      admin: req.user.role === "admin",
      email: req.user.email,
    };

    return { status: "success", payload: req.session.user };
  }

  async failLogin() {
    console.log("login failed");
    return { error: "Login failed" };
  }

  async currentUser(req) {
    const user = req.session.user;
    return { status: "success", payload: user };
  }

  async logout(req) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject({ status: "error", error: err });
        } else {
          resolve("/login");
        }
      });
    });
  }

  async status(req) {
    if (req.session.user) {
      return {
        isAuthenticated: true,
        isAdmin: req.session.user.admin,
      };
    } else {
      return {
        isAuthenticated: false,
        isAdmin: false,
      };
    }
  }
}

module.exports = SessionsService;
