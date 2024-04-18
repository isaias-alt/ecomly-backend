const util = require('util');

const mediaHelper = require('../../helpers/media.helper');
const { Category } = require('../../models/category.model');

const addCategory = async (req, res) => {
  try {
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
    let category = new Category(req.body);

    category = category.save();

    if (!category) {
      return res.status.json({
        message: 'The category could not be created'
      });
    }

    return res.status(201).json({ category });

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const editCategory = async (req, res) => { }

const deleteCategory = async (req, res) => { }

module.exports = { addCategory, editCategory, deleteCategory };