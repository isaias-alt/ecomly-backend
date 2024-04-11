// USER
const getUsersCount = async (req, res) => { }
const deleteUser = async (req, res) => { }

// CATEGORIES
const addCategory = async (req, res) => { }
const editCategory = async (req, res) => { }
const deleteCategory = async (req, res) => { }

// PRODUCTS
const getProductsCount = async (req, res) => { }
const addProduct = async (req, res) => { }
const editProduct = async (req, res) => { }
const deleteProduct = async (req, res) => { }
const deleteProductImages = async (req, res) => { }

// ORDERS
const getOrders = async (req, res) => { }
const getOrdersCount = async (req, res) => { }
const changeOrderStatus = async (req, res) => { }

module.exports = {
  getUsersCount,
  deleteUser,
  addCategory,
  editCategory,
  deleteCategory,
  getProductsCount,
  addProduct,
  editProduct,
  deleteProduct,
  deleteProductImages,
  getOrders,
  getOrdersCount,
  changeOrderStatus,
};