const { Product } = require('../../models/product.model');

const getProducts = async (req, res) => { }

const getProductsCount = async (_, res) => {
  try {
    const productsCount = Product.countDocument();

    if (!productsCount) {
      return res.status(500).json({
        message: 'Could not count Products.',
        code: 500
      });
    }

    return res.json({ productsCount });

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const addProduct = async (req, res) => { }

const editProduct = async (req, res) => { }

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found!',
        code: 404
      });
    }

    await Product.deleteOne({ _id: productId });

    return res.status(204).end();

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const deleteProductImages = async (req, res) => { }

module.exports = { getProductsCount, addProduct, editProduct, deleteProduct, deleteProductImages, getProducts };