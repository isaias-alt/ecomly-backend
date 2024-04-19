const userController = require('./admin/users.controller');
const orderController = require('./admin/orders.controller');
const productsController = require('./admin/products.controller');
const categoriesController = require('./admin/categories.controller');

const adminController = {
  deleteUser: userController.deleteUser,
  getUsersCount: userController.getUsersCount,

  addCategory: categoriesController.addCategory,
  editCategory: categoriesController.editCategory,
  deleteCategory: categoriesController.deleteCategory,

  addProduct: productsController.addProduct,
  editProduct: productsController.editProduct,
  deleteProduct: productsController.deleteProduct,
  getProductsCount: productsController.getProductsCount,
  deleteProductImages: productsController.deleteProduct,

  getOrders: orderController.getOrders,
  deleteOrder: orderController.deleteOrder,
  getOrdersCount: orderController.getOrdersCount,
  changeOrderStatus: orderController.changeOrderStatus,

}

module.exports = { adminController };
