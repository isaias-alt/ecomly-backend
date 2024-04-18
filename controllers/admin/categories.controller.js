const addCategory = async (req, res) => {
  try {

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