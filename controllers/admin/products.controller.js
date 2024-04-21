const multer = require('multer');

const mediaHelper = require('../../helpers/media.helper');
const { Product } = require('../../models/product.model');
const { Category } = require('../../models/category.model');
const { Review } = require('../../models/review.model');
const { default: mongoose } = require('mongoose');

const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skipIndex = (page - 1) * limit;

  try {
    const products = await Product.find()
      .skip(skipIndex)
      .limit(limit)
      .populate('category', 'name')
      .select('-reviews')
      .exec();

    const productsCount = await Product.countDocuments();

    const totalPages = Math.ceil(productsCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pageInfo: {
          currentPage: page,
          totalPages,
          totalProducts: productsCount,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const getProductsCount = async (_, res) => {
  try {
    const productsCount = Product.countDocuments();

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

const addProduct = async (req, res) => {
  try {
    const uploadImage = util.promisify(
      mediaHelper.upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ])
    );

    try {
      await uploadImage(req, res);
    } catch (error) {
      return res.status(500).json({
        type: error.name,
        message: `${error.message}{${error.fields}}`,
        storageErrors: error.storageErrors,
        code: 500
      });
    }

    const category = await Category.findById(req.params.category);
    if (!category) {
      return res.status(404).json({
        message: 'Invalid category',
        code: 404
      });
    }

    if (category.markedForDeletion) {
      return res.status(404).json({
        message: 'Category marked for deletion. You cannot add products to this category',
        code: 404
      });
    }

    const image = req.files['image'][0];
    if (!image) {
      return res.status(404).json({
        message: 'Not image found!',
        code: 404,
      });
    }
    req.body['image'] = `${req.protocol}://${req.get('host')}/${image.path}`;

    const gallery = req.files['images'];
    const imagePaths = [];
    if (gallery) {
      for (const image of gallery) {
        const imagePath = `${req.protocol}://${req.get('host')}/${image.path}`;
        imagePaths.push(imagePath);
      }
    }

    if (imagePaths.length > 0) {
      req.body['images'] = imagePaths;
    }

    const product = new Product(req.body).save();
    if (!product) {
      return res.status(500).json({
        message: 'The product could be not created',
        code: 500
      });
    }

    return res.status(201).json(product);

  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(error.code).json({
        message: error.message,
        code: error.code
      });
    }
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const editProduct = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !(await Product.findById(req.params.id))
    ) {
      return res.status(404).json({
        message: 'Invalid product',
        code: 404
      });
    }

    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(404).json({
          message: 'invalid category',
          code: 404
        });
      }
      if (category.markedForDeletion) {
        return res.status(404).json({
          message: 'Category marked for deletion. You cannot add products to this category',
          code: 404
        });
      }

      const product = await Product.findById(req.params.id);

      if (req.body.images) {
        const limit = 10 - product.images.length;

        const uploadGallery = util.promisify(
          mediaHelper.upload.fields([
            { name: 'images', maxCount: limit },
          ])
        );

        try {
          await uploadGallery(req, res);
        } catch (error) {
          return res.status(500).json({
            type: error.name,
            message: `${error.message}{${error.fields}}`,
            storageErrors: error.storageErrors,
            code: 500
          });
        }

        const imagesFiles = req.files['images'];
        const updateGallery = imagesFiles && imagesFiles > 0;
        if (updateGallery) {
          const imagePaths = [];
          for (const image of imagesFiles) {
            const imagePath = `${req.protocol}://${req.get('host')}/${image.path}`;
            imagePaths.push(imagePath);
          }
          req.body['images'] = [...product.images, ...imagePaths]
        }

      }

      if (req.body.image) {
        const uploadImage = util.promisify(
          mediaHelper.upload.fields([
            { name: 'image', maxCount: 1 }
          ])
        );

        try {
          await uploadImage(req, res);

        } catch (error) {
          return res.status(500).json({
            type: error.name,
            message: `${error.message}{${error.fields}}`,
            storageErrors: error.storageErrors,
            code: 500
          });
        }

        const image = req.files['image'][0];
        if (!image) {
          return res.status(404).json({
            message: 'Not image found!',
            code: 404,
          });
        }

        req.body['image'] = `${req.protocol}://${req.get('host')}/${image.path}`;
      }

    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: 'The product not found!',
        code: 404
      });
    }

    return res.json(updatedProduct);

  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(error.code).json({
        message: error.message,
        code: error.code
      });
    }
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(404).json({
        message: 'Invalid product',
        code: 404
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found!',
        code: 404
      });
    }

    await mediaHelper.deleteImages([...product.images, ...product.image], 'ENOENT');

    await Review.deleteMany({ _id: { $in: product.reviews } });

    await Product.findByIdAndDelete(productId);

    return res.status(204).end();

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const deleteProductImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const { deletedImageUrls } = req.body;

    if (!mongoose.isValidObjectId(productId) || !Array.isArray(deletedImageUrls)) {
      return res.status(400).json({
        message: 'Invalid request data',
        code: 400
      });
    }

    await mediaHelper.deleteImages(deletedImageUrls);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found!',
        code: 404
      });
    }

    product.images.filter((image) => !deletedImageUrls.includes(image));
    await product.save();

    return res.status(204).end();

  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        message: 'Image not found',
        code: 404
      });
    }
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

module.exports = { getProductsCount, addProduct, editProduct, deleteProduct, deleteProductImages, getProducts };