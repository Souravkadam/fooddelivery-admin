import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../util/constants";
import "./ListFood.css";

const ListFood = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/foods`);
      setFoods(response.data);
    } catch (error) {
      setMessage({ type: "danger", text: "Failed to load food items." });
    } finally {
      setLoading(false);
    }
  };

  const deleteFood = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE_URL}/foods/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setFoods((prev) => prev.filter((f) => f.id !== id));
      setMessage({ type: "success", text: "Food item deleted successfully." });
    } catch (error) {
      setMessage({ type: "danger", text: "Failed to delete food item." });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const filtered = foods.filter(
    (f) =>
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Food List</h4>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchFoods}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

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
        <div className="card-body">
          {/* Search */}
          <div className="mb-3">
            <div className="input-group" style={{ maxWidth: 360 }}>
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              No food items found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((food) => (
                    <tr key={food.id}>
                      <td>
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          width={56}
                          height={56}
                          className="rounded food-list-img"
                        />
                      </td>
                      <td className="fw-semibold">{food.name}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {food.category}
                        </span>
                      </td>
                      <td className="text-primary fw-bold">₹{food.price}</td>
                      <td className="text-muted small food-list-desc">
                        {food.description}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteFood(food.id)}
                          disabled={deletingId === food.id}
                          aria-label={`Delete ${food.name}`}
                        >
                          {deletingId === food.id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListFood;
