const { Order } = require('../../models/order.model');
const { OrderItem } = require('../../models/orderItem.model');

const getOrders = async (_, res) => {
  try {
    const orders = await Order.find()
      .select('-statusHistory')
      .populate('user', 'name email')
      .sort({ dateOrdered: -1 })
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product',
          select: 'name',
          populate: {
            path: 'category',
            select: 'name',
          },
        },
      });

    if (!orders) {
      return res.status(404).json({ message: 'Orders not found' });
    }

    return res.json(orders);

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
}

const getOrdersCount = async (_, res) => {
  try {
    const ordersCount = Order.countDocuments();

    if (!ordersCount) {
      return res.status(500).json({ message: 'Could not count users.' });
    }

    return res.json({ ordersCount });

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: `${error.message}{${error.fields}}`,
      storageErrors: error.storageErrors,
    });
  }
}

const changeOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const newStatus = req.params.status;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found!' });
    }

    if (!order.statusHistory.includes(order.status)) {
      order.statusHistory.push(order.status);
    }

    order.status = newStatus;
    order = order.save();

    return res.json(order);

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message
    });
  }
}

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found!' });
    }

    for (const orderItemId of order.orderItems) {
      await OrderItem.findByIdAndDelete(orderItemId);
    }

    return res.status(204).end();

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message
    });
  }
}

module.exports = { getOrders, getOrdersCount, changeOrderStatus, deleteOrder };