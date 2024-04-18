const { User } = require('../../models/user.model');
const { Order } = require('../../models/order.model');
const { Token } = require('../../models/token.model');
const { OrderItem } = require('../../models/order_item.model');
const { CartProduct } = require('../../models/cart_product.model');

const getUsersCount = async (_, res) => {
  try {
    const userCount = User.countDocuments();

    if (!userCount) {
      return res.status(500).json({
        message: 'Could not count users.',
        code: 500
      });
    }

    return res.json({ userCount });

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found!',
        code: 404
      });
    }

    const orders = await Order.find({ user: userId });
    const orderItemsIds = await orders.flatMap((order) => order.orderItems);

    await Order.deleteMany({ user: userId });
    await OrderItem.deleteMany({ _id: { $in: orderItemsIds } });

    await CartProduct.deleteMany({ _id: { $in: user.cart } })

    await User.findByIdAnd(
      userId, {
      $pull: {
        cart: { $exists: true }
      }
    });

    await Token.deleteOne({ userId: userId });

    await User.deleteOne({ _id: userId });

    return res.status(204).end();

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

module.exports = { getUsersCount, deleteUser };