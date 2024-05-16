const hotels = require("../model/hotelModel");
const cloudinary = require("cloudinary").v2;
const stripe = require("stripe")(process.env.STRIPE_KEY);


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const addHotel = async (req, res) => {
  console.log(req.body);
  const {
    name,
    city,
    country,
    description,
    pricePerNight,
    roomType,
    starRating,
    facilities,
    type,
    adultCount,
    childCount,
  } = req.body;
  const { images } = req.files;
  console.log(images);

  try {
    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path);
        return result.secure_url;
      })
    );
    const newhotel = new hotels({
      name,
      city,
      country,
      description,
      pricePerNight,
      roomType,
      starRating,
      facilities,
      type,
      imageUrls: imageUrls,
      adultCount,
      childCount,
      addedBy: req.user.id,
    });
    await newhotel.save();
    res.json({
      success: true,
      message: "Hotel added successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Hotel not added",
    });
    console.log(error);
  }
};

const fetchHotels = async (req, res) => {
  try {
    const userId = req.user.id;
    const userHotels = await hotels.find({ addedBy: userId });

    res.json({
      success: true,
      hotels: userHotels,
    });
  } catch (error) {
    console.error("Error fetching user's hotels:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user's hotels",
    });
  }
};

const fetchHotelById = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const hotel = await hotels.findById(hotelId).populate({
      path: "comments",
      populate: {
        path: "user",
      },
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.json({
      success: true,
      hotel: hotel,
    });
  } catch (error) {
    console.error("Error fetching hotel by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hotel",
    });
  }
};

const updateHotelById = async (req, res) => {
  console.log(req.body);
  const {
    name,
    city,
    country,
    description,
    pricePerNight,
    roomType,
    starRating,
    facilities,
    type,
    adultCount,
    childCount,
  } = req.body;
  const { images } = req.files;
  console.log(images);

  try {
    if (!images) {
      const updatedHotel = {
        name,
        city,
        country,
        description,
        pricePerNight,
        roomType,
        starRating,
        facilities,
        type,
        adultCount,
        childCount,
      };
      await hotels.findByIdAndUpdate(req.params.id, updatedHotel);
      res.json({
        success: true,
        message: "Hotel updated successfully",
      });
    } else {
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const result = await cloudinary.uploader.upload(image.path);
          return result.secure_url;
        })
      );
      const updatedHotel = {
        name,
        city,
        country,
        description,
        pricePerNight,
        roomType,
        starRating,
        facilities,
        type,
        imageUrls: imageUrls,
        adultCount,
        childCount,
      };
      await hotels.findByIdAndUpdate(req.params.id, updatedHotel);
      res.json({
        success: true,
        message: "Hotel updated successfully",
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: "Hotel not updated",
    });
    console.log(error);
  }
};

const deleteHotelById = async (req, res) => {
  try {
    await hotels.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Hotel not deleted",
    });
    console.log(error);
  }
};

const search = async (req, res) => {
  console.log(req.body);
  try {
    const query = constructSearchQuery(req.body);
    // query.isApproved = true;
    console.log("query", query);

    let sortOptions = {};
    switch (req.query.sortOptions) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
      default:
        sortOptions = {};
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(req.query.page || "1", 10);
    const skip = (pageNumber - 1) * pageSize;
    const hotel = await hotels
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);
    const total = await hotels.countDocuments(query);
    const response = {
      data: hotel,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
    console.log(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const constructSearchQuery = (queryParams) => {
  let constructedQuery = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};

const fetchHotelForAdmin = async (req, res) => {
  try {
    const allHotels = await hotels.find();
    res.json({
      success: true,
      hotels: allHotels,
    });
  } catch (error) {
    console.error("Error fetching user's hotels:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user's hotels",
    });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;
    await hotels.findByIdAndUpdate(req.params.id, { isApproved: isApproved });
    res.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Status not updated",
    });
    console.log(error);
  }
};

module.exports = {
  addHotel,
  fetchHotels,
  fetchHotelById,
  updateHotelById,
  deleteHotelById,
  search,
  fetchHotelForAdmin,
  changeStatus,
};
