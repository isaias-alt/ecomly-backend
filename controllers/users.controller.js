const { User } = require("../models/user.model");

const getUsers = async (_, res) => {
  try {
    const users = await User.find().select('name email id isAdmin');
    if (!users) {
      return res.status(404).json({
        message: 'Users not found',
        code: 404
      });
    }
    return res.json(users);

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500,
    });
  }
}

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -resetPasswordOtp -resetPasswordOtpExpired');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 404
      });
    }
    return res.json(user);

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500,
    });
  }
}

const updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 404
      });
    }

    user.passwordHash = undefined;
    return res.json(user);

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500,
    });
  }
}

module.exports = { getUsers, getUserById, updateUser };