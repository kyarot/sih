import Drug from "../models/Drug.js";

// @desc Add new drug
export const addDrug = async (req, res) => {
  try {
    const { name, brand, category, price, quantity, expiryDate, barcode } = req.body;
    const pharmacyId = req.user.id; // pharmacy from auth token

    const drug = new Drug({
      name,
      brand,
      category,
      price,
      quantity,
      expiryDate,
      barcode,
      pharmacyId,
    });

    await drug.save();
    res.status(201).json({ success: true, data: drug });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get all drugs of logged-in pharmacy
export const getDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find({ pharmacyId: req.user.id }).sort({ name: 1 });
    res.status(200).json({ success: true, data: drugs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Search drugs in logged-in pharmacy (aggregated)
export const searchDrugs = async (req, res) => {
  try {
    const { q } = req.query;
    const regex = new RegExp(q, "i"); // case-insensitive
    
    const aggregatedDrugs = await Drug.aggregate([
      {
        $match: { 
          pharmacyId: req.user.id,
          $or: [
            { name: { $regex: regex } },
            { brand: { $regex: regex } },
            { category: { $regex: regex } }
          ]
        }
      },
      {
        $group: {
          _id: {
            name: "$name",
            brand: "$brand"
          },
          totalQuantity: { $sum: "$quantity" },
          avgPrice: { $avg: "$price" },
          categories: { $addToSet: "$category" },
          expiryDates: { $addToSet: "$expiryDate" },
          drugIds: { $push: "$_id" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id.name",
          brand: "$_id.brand",
          quantity: "$totalQuantity",
          price: { $round: ["$avgPrice", 2] },
          category: { $arrayElemAt: ["$categories", 0] },
          expiryDate: { $min: "$expiryDates" },
          drugIds: 1
        }
      },
      {
        $sort: { name: 1 }
      },
      {
        $limit: 20
      }
    ]);

    res.status(200).json({ success: true, data: aggregatedDrugs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update drug (price, qty, etc.)
export const updateDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const drug = await Drug.findOneAndUpdate(
      { _id: id, pharmacyId: req.user.id },
      req.body,
      { new: true }
    );

    if (!drug) return res.status(404).json({ success: false, message: "Drug not found" });

    res.status(200).json({ success: true, data: drug });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete drug
export const deleteDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const drug = await Drug.findOneAndDelete({ _id: id, pharmacyId: req.user.id });

    if (!drug) return res.status(404).json({ success: false, message: "Drug not found" });

    res.status(200).json({ success: true, message: "Drug deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Low stock alert (optional)
export const lowStock = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10; // default 10
    const drugs = await Drug.find({
      pharmacyId: req.user.id,
      quantity: { $lt: threshold },
    });

    res.status(200).json({ success: true, data: drugs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// @desc Get aggregated stock by name and brand
export const getAggregatedStock = async (req, res) => {
  try {
    const aggregatedDrugs = await Drug.aggregate([
      {
        $match: { pharmacyId: req.user.id }
      },
      {
        $group: {
          _id: {
            name: "$name",
            brand: "$brand"
          },
          totalQuantity: { $sum: "$quantity" },
          avgPrice: { $avg: "$price" },
          categories: { $addToSet: "$category" },
          expiryDates: { $addToSet: "$expiryDate" },
          drugIds: { $push: "$_id" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id.name",
          brand: "$_id.brand",
          quantity: "$totalQuantity",
          price: { $round: ["$avgPrice", 2] },
          category: { $arrayElemAt: ["$categories", 0] },
          expiryDate: { $min: "$expiryDates" },
          drugIds: 1
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    res.status(200).json({ success: true, data: aggregatedDrugs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  };
};

// @desc Delete drugs by name and brand
export const deleteDrugsByName = async (req, res) => {
  try {
    const { name, brand } = req.params;
    
    if (!name) {
      return res.status(400).json({ success: false, message: "Drug name is required" });
    }

    const deleteQuery = { 
      pharmacyId: req.user.id,
      name: decodeURIComponent(name)
    };
    
    if (brand && brand !== 'undefined') {
      deleteQuery.brand = decodeURIComponent(brand);
    }

    const result = await Drug.deleteMany(deleteQuery);
    
    res.status(200).json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} drug(s)`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};