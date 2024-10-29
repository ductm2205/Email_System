const dbConnection = require("../config/dbConnection");
const bcrypt = require("bcrypt");

async function renderSignInPage(req, res) {
  res.render("auth/signin", { error: null });
}

async function signin(req, res) {
  const { email, password } = req.body;

  try {
    // Get user from db
    const [users] = await dbConnection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.render("auth/signin", { error: "Invalid email or password" });
    }

    const user = users[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);

    // Invalid credentials
    if (!match) {
      return res.render("auth/signin", {
        error: "Invalid email or password",
      });
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
    };

    res.redirect("/inbox");
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.render("auth/signin", {
      error: "An error occurred during sign-in",
    });
  }
}

async function renderSignUpPage(req, res) {
  res.render("auth/signup", { error: null, success: null });
}

async function signup(req, res) {
  const { fullName, email, password, confirmPassword } = req.body;

  try {
    // Check if email already exists
    const [existingUsers] = await dbConnection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.render("auth/signup", {
        error: "Email address is already in use",
        success: null,
        values: { fullName, email },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const isSignedUp = await dbConnection.execute(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
      [fullName, email, hashedPassword]
    );

    if (!isSignedUp) {
      res.render("auth/signup", {
        error: "Something went wrong!",
        success: null,
        values: null,
      });
    }
    // Show success message
    res.render("auth/signup", {
      error: null,
      success: "Account created successfully! You can now sign in.",
      values: {},
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.render("auth/signup", {
      error: "An error occurred during sign-up",
      success: null,
      values: { fullName, email },
    });
  }
}

async function signout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render("error", {
        message: "Server error",
        status: 500,
      });
    }
    res.redirect("/");
  });
}

module.exports = {
  renderSignInPage,
  renderSignUpPage,
  signin,
  signup,
  signout,
};
