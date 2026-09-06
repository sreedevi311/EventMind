import Sponsor from "../models/Sponsor.js";

// ==========================================
// CREATE SPONSOR
// POST /api/sponsors
// ==========================================

export const createSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Sponsor created successfully.",
      data: sponsor,
    });
  } catch (error) {
    console.error("Create Sponsor Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL SPONSORS
// GET /api/sponsors
// ==========================================

export const getSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: sponsors,
    });
  } catch (error) {
    console.error("Get Sponsors Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SPONSOR
// GET /api/sponsors/:id
// ==========================================

export const getSponsorById = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(
      req.params.id
    ).lean();

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: sponsor,
    });
  } catch (error) {
    console.error(
      "Get Sponsor Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE SPONSOR
// PUT /api/sponsors/:id
// ==========================================

export const updateSponsor = async (req, res) => {
  try {
    const sponsor =
      await Sponsor.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sponsor updated successfully.",
      data: sponsor,
    });
  } catch (error) {
    console.error(
      "Update Sponsor Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE SPONSOR
// DELETE /api/sponsors/:id
// ==========================================

export const deleteSponsor = async (req, res) => {
  try {
    const sponsor =
      await Sponsor.findByIdAndDelete(
        req.params.id
      );

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sponsor deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Sponsor Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};