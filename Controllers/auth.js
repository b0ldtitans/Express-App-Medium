const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const secret = "jwt-secret-key";

exports.loginHandler = async (req, res) => {
  const { user_identity, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: user_identity }, { username: user_identity }],
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email/username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email/username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      secret,
      {
        expiresIn: "1d",
      }
    );

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.handleRegister = async (req, res) => {
  const { username, password, name, email } = req.body;
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username: username }],
    },
  });

  if (existingUser) {
    return res.status(400).json({
      ok: false,
      message: "Username already exists",
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = await User.create({
    username,
    password: hashedPassword,
    name,
    email,
    isAdmin: false,
  });

  return res.json({
    ok: true,
    data: {
      username: newUser.username,
      name: newUser.name,
    },
  });
};

exports.getAllAccounts = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"],
      },
    });
    return res.json({
      ok: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
};

exports.changeUsernameHandler = async (req, res) => {
  const { newUsername } = req.body;
  const userId = req.user.id;

  try {
    const updatedUser = await User.update(
      { username: newUsername },
      { where: { id: userId } }
    );

    if (updatedUser[0] === 1) {
      res.json({ message: "Username updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUserHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.destroy({ where: { id } });
    if (deletedUser) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
