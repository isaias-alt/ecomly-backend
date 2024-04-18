const { Order } = require('../../models/order.model');

const getOrders = async (_, res) => {
  try {
    const orders = await Order.find().select('-statusHistory').sort({ dateOrdered: -1 });

    if (!orders) {
      return res.status(404).json({
        message: 'Orders not found',
        code: 404
      });
    }

    return res.json(orders);

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: `${error.message}{${error.fields}}`,
      storageErrors: error.storageErrors,
      code: 500
    });
  }
}

const getOrdersCount = async (_, res) => {
  try {
    const ordersCount = Order.countDocument();

    if (!ordersCount) {
      return res.status(500).json({
        message: 'Could not count users.',
        code: 500
      });
    }

    return res.json({ ordersCount });

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: `${error.message}{${error.fields}}`,
      storageErrors: error.storageErrors,
      code: 500
    });
  }
}

const changeOrderStatus = async (req, res) => { }

module.exports = { getOrders, getOrdersCount, changeOrderStatus };