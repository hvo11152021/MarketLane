import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../axios";
import unplugged from "../assets/unplugged.png";

const CATEGORIES = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imageFallbackUrl, setImageFallbackUrl] = useState(null);

  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ROLE_USER") 
      navigate("/");
    else if (role !== "ROLE_USER") 
      navigate("/");
  }, [navigate]);

  // create preview URL for picked file
  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (imageFallbackUrl) URL.revokeObjectURL(imageFallbackUrl);
    };
  }, [previewUrl, imageFallbackUrl]);

  const blobToFile = (blobData, fileName) =>
    new File([blobData], fileName, { type: blobData.type || "image/jpeg" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await API.get(`/product/${id}`);
        const p = res.data || {};

        setForm({
          id: p.id ?? Number(id),
          name: p.name ?? "",
          description: p.description ?? "",
          brand: p.brand ?? "",
          price: p.price ?? "",
          category: p.category ?? "",
          releaseDate: p.releaseDate ?? "",
          productAvailable: Boolean(p.productAvailable),
          stockQuantity: p.stockQuantity ?? "",
        });

        // Try load image for preview
        try {
          const imgRes = await API.get(`/product/${id}/image`, { responseType: "blob" });
          const fileName = p.imageName || `product-${id}.jpg`;
          const file = blobToFile(imgRes.data, fileName);
          setImageFile(file);

          // Also store a preview URL that works even if file isn't picked again
          const url = URL.createObjectURL(imgRes.data);
          setImageFallbackUrl(url);
        } catch {
          setImageFile(null);
          setImageFallbackUrl(null);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onToggle = (e) => {
    const { checked } = e.target;
    setForm((prev) => ({ ...prev, productAvailable: checked }));
  };

  const onImage = (e) => {
    const f = e.target.files?.[0];
    if (f) setImageFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const fd = new FormData();

      // send image if user has one (or previously fetched)
      if (imageFile) fd.append("imageFile", imageFile);

      fd.append("product", new Blob([JSON.stringify(form)], { type: "application/json" }));

      await API.put(`/product/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/product/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const heroImg = previewUrl || imageFallbackUrl || unplugged;

  return (
    <div className="page">
      <div className="container py-4">
        {/* Header */}
        <div className="up-header mb-3">
          <div>
            <h3 className="mb-1 fw-bold">Update product</h3>
          </div>

          <div className="d-flex gap-2">
            <Link to="/" className="btn btn-outline-secondary btn-sm up-pill">
              Back
            </Link>
            <button
              className="btn btn-primary btn-sm up-pill"
              type="submit"
              form="update-form"
              disabled={loading || saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="up-card p-4 text-center text-muted">Loading…</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="row g-4">
            {/* Left: form */}
            <div className="col-lg-7">
              <form id="update-form" onSubmit={handleSubmit} className="up-card p-3 p-md-4">
                <div className="up-section-title">Details</div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label up-label">Name</label>
                    <input
                      className="form-control up-input"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="Product name"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label up-label">Brand</label>
                    <input
                      className="form-control up-input"
                      name="brand"
                      value={form.brand}
                      onChange={onChange}
                      placeholder="Brand"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label up-label">Description</label>
                    <textarea
                      className="form-control up-input"
                      name="description"
                      value={form.description}
                      onChange={onChange}
                      placeholder="Short description"
                      rows={4}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label up-label">Price</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control up-input"
                        name="price"
                        value={form.price}
                        onChange={onChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="col-md-8">
                    <label className="form-label up-label">Category</label>
                    <select
                      className="form-select up-input"
                      name="category"
                      value={form.category}
                      onChange={onChange}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label up-label">Release Date</label>
                    <input
                      type="date"
                      className="form-control up-input"
                      name="releaseDate"
                      value={form.releaseDate || ""}
                      onChange={onChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label up-label">Stock</label>
                    <input
                      type="number"
                      className="form-control up-input"
                      name="stockQuantity"
                      value={form.stockQuantity}
                      onChange={onChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div className="col-md-6 d-flex align-items-end justify-content-between">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="available"
                        checked={form.productAvailable}
                        onChange={onToggle}
                      />
                      <label className="form-check-label up-label" htmlFor="available">
                        Available
                      </label>
                    </div>

                    <div className="up-hint">
                      ID: <span className="up-mono">{id}</span>
                    </div>
                  </div>
                </div>

                <div className="up-divider my-4" />

                <div className="d-flex justify-content-end gap-2">
                  <Link to="/" className="btn btn-outline-secondary up-pill">
                    Cancel
                  </Link>
                  <button className="btn btn-primary up-pill" type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: image */}
            <div className="col-lg-5">
              <div className="up-card p-3 p-md-4">

                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="up-section-title" style={{ marginBottom: 0 }}>
                    Image
                  </div>
                  <div className="up-hint">{imageFile?.name || "No file selected"}</div>
                </div>

                <div className="up-image mb-2">
                  <img src={heroImg} alt="Product" />
                </div>

                <label className="form-label up-label">Upload Image</label>
                <input className="form-control up-input" type="file" accept="image/*" onChange={onImage} />

                <div className="up-hint mt-2">
                  Tip: use JPG/PNG. Big images look better on the home grid.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Local styles (no global Bootstrap overrides) */}
      <style>{`
        /* Compact UpdateProduct styles */
        .up-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .up-header h3 { margin: 0; font-size: 1.05rem; }
        .up-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow);
          padding: 10px;
        }
        .up-pill {
          border-radius: 999px !important;
          font-weight: 700;
          padding: 6px 10px;
          font-size: 0.85rem;
        }
        .up-section-title {
          font-weight: 800;
          letter-spacing: -0.2px;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }
        .up-label {
          font-weight: 700;
          font-size: .85rem;
          color: var(--text);
        }
        .up-input {
          border-radius: 10px !important;
          border: 1px solid var(--border) !important;
          background: var(--surface) !important;
          color: var(--text) !important;
          padding: 6px 10px !important;
          font-size: 0.95rem;
        }
        .dark-theme .up-input { background: var(--surface_2) !important; }
        .up-divider { height: 1px; width: 100%; background: var(--hr_line); margin: 12px 0; }
        .up-hint { color: var(--muted); font-size: .82rem; }
        .up-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: .9rem; }
        .up-image {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--surface_2);
          aspect-ratio: 4 / 3;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .up-image img { width: 100%; height: 100%; object-fit: cover; display: block; }

        @media (max-width: 992px) {
          .up-image { height: 160px; }
        }
        @media (max-width: 576px) {
          .up-header { align-items: start; flex-direction: column; }
          .up-card { padding: 8px; }
        }
      `}</style>
    </div>
  );
};

export default UpdateProduct;
