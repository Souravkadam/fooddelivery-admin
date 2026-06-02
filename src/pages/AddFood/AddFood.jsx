import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../util/constants";
import addimage from "../../assets/addimage.png";
import "./AddFood.css";

const CATEGORIES = [
  // These match the Frontend explore menu icons exactly
  "Biryani",
  "Burger",
  "ICE cream",
  "Pizza",
  "Rolls",
  "Salad",
  "Chicken",
  // General Meal Types
  "Main Course",
  "Appetizers",
  "Starters",
  "Desserts",
  "Beverages",
  "Fast Food",
  "Breakfast",
  "Brunch",
  "Lunch",
  "Dinner",
  "Soups",
  "Side Dishes",
  "Snacks",
  // Cuisines & Regional
  "North Indian",
  "South Indian",
  "Indo-Chinese",
  "Italian",
  "Continental",
  "Mexican",
  "American",
  "Asian",
  "Mediterranean",
  "Street Food",
  // Specific Food Groups
  "Sandwiches",
  "Wraps & Rolls",
  "Biryani & Pulao",
  "Breads & Naan",
  "Rice & Noodles",
  "Pasta",
  "Seafood",
  "Tandoori & Kebabs",
  "Thalis",
  "Chaat",
  "Curries & Gravies",
  "Dals & Lentils",
  "Fried Chicken",
  "Momos & Dumplings",
  "Steaks & Grills",
  // Drinks & Sweets
  "Hot Beverages (Tea/Coffee)",
  "Cold Beverages",
  "Shakes & Smoothies",
  "Mocktails",
  "Baked Goods & Pastries",
  // Specialty / Dietary
  "Healthy Eats",
  "Vegan Options",
  "Combo Meals",
];

const AddFood = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage({ type: "danger", text: "Please select a food image." });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Backend expects: @RequestPart("food") String + @RequestPart("file") MultipartFile
    const formData = new FormData();
    // Append food as a Blob with explicit application/json content type
    // This ensures Spring's @RequestPart can parse it correctly
    const foodBlob = new Blob(
      [JSON.stringify({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
      })],
      { type: "application/json" }
    );
    formData.append("food", foodBlob);
    formData.append("file", imageFile);

    try {
      await axios.post(`${API_BASE_URL}/foods`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setMessage({ type: "success", text: "Food item added successfully!" });
      setForm({ name: "", description: "", price: "", category: "" });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Add food error:", error.response?.data || error.message);
      const errMsg = error.response?.data?.message
        || error.response?.data?.error
        || error.response?.statusText
        || "Failed to add food. Please try again.";
      setMessage({
        type: "danger",
        text: `Error: ${errMsg}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="mb-4 fw-bold">Add New Food Item</h4>

      {message && (
        <div className={`alert alert-${message.type} alert-dismissible`} role="alert">
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={onSubmit}>
            <div className="row g-4">
              {/* Image Upload */}
              <div className="col-12">
                <label className="form-label fw-semibold">Food Image</label>
                <div className="add-food-img-upload">
                  <label htmlFor="imageUpload" className="add-food-img-label">
                    <img
                      src={imagePreview || addimage}
                      alt="Upload"
                      className={imagePreview ? "add-food-preview" : "add-food-placeholder"}
                    />
                    {!imagePreview && (
                      <p className="text-muted mt-2 mb-0 small">Click to upload image</p>
                    )}
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    className="d-none"
                    onChange={onImageChange}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="col-md-6">
                <label htmlFor="name" className="form-label fw-semibold">
                  Food Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  placeholder="e.g. Chicken Biryani"
                  value={form.name}
                  onChange={onChangeHandler}
                  required
                />
              </div>

              {/* Category */}
              <div className="col-md-6">
                <label htmlFor="category" className="form-label fw-semibold">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={onChangeHandler}
                  required
                >
                  <option value="">Select category...</option>
                  <optgroup label="── Popular (with icons on website) ──">
                    {["Biryani","Burger","ICE cream","Pizza","Rolls","Salad","Chicken"].map(c=><option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="── General Meal Types ──">
                    {["Main Course","Appetizers","Starters","Desserts","Beverages","Fast Food","Breakfast","Brunch","Lunch","Dinner","Soups","Side Dishes","Snacks"].map(c=><option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="── Cuisines & Regional ──">
                    {["North Indian","South Indian","Indo-Chinese","Italian","Continental","Mexican","American","Asian","Mediterranean","Street Food"].map(c=><option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="── Specific Food Groups ──">
                    {["Sandwiches","Wraps & Rolls","Biryani & Pulao","Breads & Naan","Rice & Noodles","Pasta","Seafood","Tandoori & Kebabs","Thalis","Chaat","Curries & Gravies","Dals & Lentils","Fried Chicken","Momos & Dumplings","Steaks & Grills"].map(c=><option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="── Drinks & Sweets ──">
                    {["Hot Beverages (Tea/Coffee)","Cold Beverages","Shakes & Smoothies","Mocktails","Baked Goods & Pastries"].map(c=><option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="── Specialty / Dietary ──">
                    {["Healthy Eats","Vegan Options","Combo Meals"].map(c=><option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>

              {/* Price */}
              <div className="col-md-4">
                <label htmlFor="price" className="form-label fw-semibold">
                  Price (₹) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    name="price"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={onChangeHandler}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="col-12">
                <label htmlFor="description" className="form-label fw-semibold">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Describe the food item..."
                  value={form.description}
                  onChange={onChangeHandler}
                  required
                ></textarea>
              </div>

              {/* Submit */}
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary px-5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>Add Food
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFood;
