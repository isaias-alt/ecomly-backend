const userController = require('./admin/users.controller');
const orderController = require('./admin/orders.controller');
const productsController = require('./admin/products.controller');
const categoriesController = require('./admin/categories.controller');

const adminController = {
  getUsersCount: userController.getUsersCount,
  deleteUser: userController.deleteUser,

  addCategory: categoriesController.addCategory,
  editCategory: categoriesController.editCategory,
  deleteCategory: categoriesController.deleteCategory,

  getProductsCount: productsController.getProductsCount,
  addProduct: productsController.addProduct,
  editProduct: productsController.editProduct,
  deleteProductImages: productsController.deleteProduct,
  deleteProduct: productsController.deleteProduct,

  getOrders: orderController.getOrders,
  getOrdersCount: orderController.getOrdersCount,
  changeOrderStatus: orderController.changeOrderStatus,

}

module.exports = { adminController };
