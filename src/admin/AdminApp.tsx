import { useEffect, useMemo, useRef, useState } from "react";
import {
  categories,
  categoryName,
  productsInCategory,
  type Product,
} from "../data/catalog";

const DRAFT_KEY = `maison-debrah-admin-demo-v1:${import.meta.env.BASE_URL}`;
const PAGE_SIZE = 9;

const imageUrl = (src: string) =>
  src.startsWith("/") ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src;
const priceLabel = (price: number | null) =>
  price === null ? "On request" : `Ref. ${new Intl.NumberFormat("en-US").format(price)}`;

function sampleProducts(products: Product[]) {
  const selected = ["meubilair", "verlichting", "decoratie"].flatMap((slug) =>
    productsInCategory(products, slug).slice(0, 3),
  );
  return [
    ...new Map(selected.map((product) => [product.id, product])).values(),
  ];
}

function loadDraft(fallback: Product[]) {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(DRAFT_KEY) || "null",
    );
    if (
      saved &&
      typeof saved === "object" &&
      "products" in saved &&
      Array.isArray(saved.products)
    ) {
      return saved.products as Product[];
    }
  } catch {
    // An invalid browser draft should never block the source catalogue.
  }
  return fallback;
}

type Notice = { text: string; undo?: { product: Product; index: number } };

type FormValues = {
  name: string;
  sku: string;
  categorySlug: string;
  price: string;
  summary: string;
  description: string;
  dimensions: string;
  image: string;
};

function ProductEditor({
  product,
  products,
  onClose,
  onSave,
}: {
  product: Product | null;
  products: Product[];
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const firstField = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<FormValues>(() => ({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    categorySlug: product?.categories[0]?.slug ?? categories[0]?.slug ?? "",
    price: product?.price == null ? "" : String(product.price),
    summary: product?.summary ?? "",
    description: product?.description ?? "",
    dimensions:
      product?.dimensions === "N/A" ? "" : (product?.dimensions ?? ""),
    image: product?.images[0]?.src ?? "",
  }));
  const [error, setError] = useState("");

  useEffect(() => {
    firstField.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const set = (field: keyof FormValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  async function chooseImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 700_000) {
      setError("For this browser demo, choose an image smaller than 700 KB.");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("Unable to read image"));
        reader.onerror = () => reject(new Error("Unable to read image"));
        reader.readAsDataURL(file);
      });
      set("image", dataUrl);
      setError("");
    } catch {
      setError("The image could not be opened. Please try another file.");
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = values.name.trim();
    if (!name) return setError("Enter a product name.");
    const category = categories.find(
      (item) => item.slug === values.categorySlug,
    );
    if (!category) return setError("Choose a category.");
    const price = values.price.trim() === "" ? null : Number(values.price);
    if (price !== null && (!Number.isFinite(price) || price < 0))
      return setError("Enter a valid price or leave it blank.");
    const now = Date.now();
    const next: Product = {
      id: product?.id ?? -now,
      slug: product?.slug ?? `demo-${now}`,
      name,
      sku: values.sku.trim(),
      summary: values.summary.trim(),
      description: values.description.trim(),
      categories:
        product?.categories[0]?.slug === category.slug
          ? product.categories
          : [{ id: category.id, name: category.name, slug: category.slug }],
      images: values.image
        ? [
            {
              src: values.image,
              thumbnail: values.image,
              alt: `${name} by Maison Debrah`,
            },
            ...(product?.images.slice(1) ?? []),
          ]
        : [],
      dimensions: values.dimensions.trim() || "N/A",
      attributes: product?.attributes ?? [],
      price,
      shopOrder: product?.shopOrder ?? products.length,
    };
    onSave(next);
  }

  return (
    <div
      className="admin-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="editor-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        <div className="editor-head">
          <div>
            <span className="small-label">Product details</span>
            <h2 id="editor-title">
              {product ? "Edit product" : "Add product"}
            </h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Close editor"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <form onSubmit={submit} className="editor-form">
          <div className="editor-scroll">
            <p className="editor-note">
              Changes here are a private browser demo. They do not update the
              live website.
            </p>
            <div className="form-section-title">Product image</div>
            <div className="image-picker">
              <div className="image-picker-preview">
                {values.image ? (
                  <img
                    src={imageUrl(values.image)}
                    alt="Selected product preview"
                  />
                ) : (
                  <span>No image selected</span>
                )}
              </div>
              <div>
                <strong>
                  {values.image ? "Main photo" : "Add a main photo"}
                </strong>
                <p>JPG, PNG or WebP · up to 700 KB for this demo</p>
                <label className="secondary-button file-button">
                  Choose image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      void chooseImage(event.target.files?.[0])
                    }
                  />
                </label>
              </div>
            </div>
            {product && product.images.length > 1 && (
              <p className="helper-text">
                This product has {product.images.length - 1} additional photo
                {product.images.length > 2 ? "s" : ""}. They remain in the demo
                when you save.
              </p>
            )}
            <div className="form-section-title">Basic information</div>
            <div className="field-grid">
              <label className="field field-wide">
                Product name{" "}
                <input
                  ref={firstField}
                  value={values.name}
                  onChange={(event) => set("name", event.target.value)}
                  placeholder="e.g. Orvella"
                  required
                />
              </label>
              <label className="field">
                SKU{" "}
                <input
                  value={values.sku}
                  onChange={(event) => set("sku", event.target.value)}
                  placeholder="Product code"
                />
              </label>
              <label className="field">
                Category{" "}
                <select
                  value={values.categorySlug}
                  onChange={(event) => set("categorySlug", event.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {categoryName(item.slug, item.name)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Reference price{" "}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.price}
                  onChange={(event) => set("price", event.target.value)}
                  placeholder="Leave blank for on request"
                />
              </label>
              <label className="field">
                Dimensions{" "}
                <input
                  value={values.dimensions}
                  onChange={(event) => set("dimensions", event.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="field field-wide">
                Short description{" "}
                <textarea
                  rows={3}
                  value={values.summary}
                  onChange={(event) => set("summary", event.target.value)}
                  placeholder="A short introduction for the product page"
                />
              </label>
              <label className="field field-wide">
                Additional details{" "}
                <textarea
                  rows={4}
                  value={values.description}
                  onChange={(event) => set("description", event.target.value)}
                  placeholder="Optional product details"
                />
              </label>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="editor-footer">
            <button type="button" className="text-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save demo draft <span>→</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ConfirmDialog({
  product,
  onCancel,
  onConfirm,
}: {
  product: Product;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);
  return (
    <div className="admin-overlay confirm-overlay">
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
      >
        <div className="confirm-icon">!</div>
        <h2 id="confirm-title">Remove this product?</h2>
        <p id="confirm-description">
          <strong>{product.name}</strong> will disappear from this browser demo.
          The live website and source product remain unchanged.
        </p>
        <div className="confirm-actions">
          <button
            ref={cancelButton}
            className="secondary-button"
            onClick={onCancel}
          >
            Keep product
          </button>
          <button className="danger-button" onClick={onConfirm}>
            Remove from demo
          </button>
        </div>
      </section>
    </div>
  );
}

export default function AdminApp() {
  const [baseline, setBaseline] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/products.json`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Catalogue unavailable");
        return response.json();
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error("Invalid catalogue");
        const sample = sampleProducts(data as Product[]);
        setBaseline(sample);
        setProducts(loadDraft(sample));
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          setLoadError(true);
      });
    return () => controller.abort();
  }, []);

  function commit(next: Product[], message: string, undo?: Notice["undo"]) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ products: next }));
      setProducts(next);
      setDraftError("");
      setNotice({ text: message, undo });
      return true;
    } catch {
      setDraftError(
        "Your browser could not save this demo draft. Try a smaller image or free browser storage.",
      );
      return false;
    }
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = (products ?? []).filter((product) => {
      const matchesQuery =
        !term ||
        `${product.name} ${product.sku} ${product.summary}`
          .toLowerCase()
          .includes(term);
      const matchesCategory =
        categoryFilter === "all" ||
        product.categories.some((item) => item.slug === categoryFilter);
      return matchesQuery && matchesCategory;
    });
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price")
      filtered.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    return filtered;
  }, [products, query, categoryFilter, sort]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageProducts = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const imageCount = (products ?? []).filter(
    (product) => product.images.length > 0,
  ).length;
  const pricedCount = (products ?? []).filter(
    (product) => product.price !== null,
  ).length;
  const categoryOptions = [
    ...new Map(
      (products ?? [])
        .flatMap((product) => product.categories)
        .map((item) => [item.slug, item]),
    ).values(),
  ];

  function saveProduct(product: Product) {
    if (!products) return;
    const exists = products.some((item) => item.id === product.id);
    const next = exists
      ? products.map((item) => (item.id === product.id ? product : item))
      : [product, ...products];
    if (
      commit(
        next,
        exists
          ? `${product.name} updated in your demo.`
          : `${product.name} added to your demo.`,
      )
    )
      setEditing(null);
  }

  function removeProduct() {
    if (!products || !deleteTarget) return;
    const index = products.findIndex((item) => item.id === deleteTarget.id);
    const next = products.filter((item) => item.id !== deleteTarget.id);
    if (
      commit(next, `${deleteTarget.name} removed from your demo.`, {
        product: deleteTarget,
        index,
      })
    )
      setDeleteTarget(null);
  }

  function undoRemove() {
    if (!products || !notice?.undo) return;
    const next = [...products];
    next.splice(notice.undo.index, 0, notice.undo.product);
    commit(next, `${notice.undo.product.name} restored.`);
  }

  function resetDemo() {
    if (
      !window.confirm(
        "Discard all browser demo changes and restore the original sample products?",
      )
    )
      return;
    localStorage.removeItem(DRAFT_KEY);
    setProducts(baseline);
    setQuery("");
    setCategoryFilter("all");
    setPage(1);
    setDraftError("");
    setNotice({ text: "The demo has been restored to its original products." });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="sidebar-brand" href={import.meta.env.BASE_URL}>
          <span className="brand-mark">
            M<span>D</span>
          </span>
          <span>
            MAISON
            <br />
            DEBRAH<small>ETHIOPIA</small>
          </span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav aria-label="Admin navigation">
          <a className="sidebar-link active" href="#products">
            <span className="nav-icon">▦</span> Products{" "}
            <span className="nav-count">{products?.length ?? "—"}</span>
          </a>
          <a className="sidebar-link" href={import.meta.env.BASE_URL}>
            <span className="nav-icon">↗</span> View website
          </a>
        </nav>
        <div className="sidebar-bottom">
          <span className="demo-indicator">
            <i /> Preview mode
          </span>
          <p>This is a design demonstration. No changes are published.</p>
          <button type="button" onClick={resetDemo}>
            Reset demo
          </button>
        </div>
      </aside>
      <main className="admin-main" id="products">
        <div className="admin-topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Product catalog
          </div>
          <div className="topbar-right">
            <span className="topbar-demo">DEMO</span>
            <span className="avatar" aria-label="Demo user">
              MD
            </span>
          </div>
        </div>
        <div className="admin-content">
          <div className="page-intro">
            <div>
              <div className="small-label">YOUR COLLECTION</div>
              <h1>Products</h1>
              <p>A simple place to review and manage your collection.</p>
            </div>
            <button
              type="button"
              className="primary-button add-button"
              onClick={() => setEditing("new")}
            >
              <span>＋</span> Add product
            </button>
          </div>
          <div className="demo-banner">
            <span className="banner-symbol">✦</span>
            <div>
              <strong>Client preview</strong>
              <p>
                A small selection of real Maison Debrah products. Add, edit, and
                remove to try the workflow; changes stay in this browser.
              </p>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Products in demo</span>
              <strong>{products?.length ?? "—"}</strong>
              <small>Selected from the existing catalog</small>
            </div>
            <div className="stat-card">
              <span>With photos</span>
              <strong>{products ? imageCount : "—"}</strong>
              <small>Product image preview</small>
            </div>
            <div className="stat-card">
              <span>With a price</span>
              <strong>{products ? pricedCount : "—"}</strong>
              <small>Others show “On request”</small>
            </div>
          </div>
          <div className="collection-panel">
            <div className="collection-title">
              <div>
                <h2>Product catalog</h2>
                <p>
                  {products
                    ? `${visible.length} of ${products.length} products`
                    : "Loading products…"}
                </p>
              </div>
              <span className="collection-badge">DEMO COLLECTION</span>
            </div>
            <div className="toolbar">
              <label className="search-field">
                <span aria-hidden="true">⌕</span>
                <input
                  aria-label="Search products"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, SKU or description"
                />
              </label>
              <label className="select-field">
                <span className="sr-only">Filter by category</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All categories</option>
                  {categoryOptions.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {categoryName(item.slug, item.name)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="select-field">
                <span className="sr-only">Sort products</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="featured">Featured order</option>
                  <option value="name">Name A–Z</option>
                  <option value="price">Price: low to high</option>
                </select>
              </label>
            </div>
            {loadError ? (
              <div className="empty-state" role="alert">
                <strong>Products could not be loaded.</strong>
                <p>
                  Refresh the page or check that the site build includes the
                  product catalog.
                </p>
              </div>
            ) : !products ? (
              <div className="empty-state">Loading product photos…</div>
            ) : pageProducts.length === 0 ? (
              <div className="empty-state">
                <strong>No products found</strong>
                <p>Try another search or category.</p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setQuery("");
                    setCategoryFilter("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="admin-product-grid">
                {pageProducts.map((product) => (
                  <article className="admin-product-card" key={product.id}>
                    <div className="admin-product-photo">
                      {product.images[0] ? (
                        <img
                          src={imageUrl(
                            product.images[0].thumbnail ||
                              product.images[0].src,
                          )}
                          alt={product.images[0].alt || product.name}
                          loading="lazy"
                        />
                      ) : (
                        <span>No photo</span>
                      )}
                      <span className="photo-count">
                        {product.images.length} photo
                        {product.images.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="admin-product-info">
                      <span className="card-category">
                        {categoryName(
                          product.categories[0]?.slug ?? "",
                          product.categories[0]?.name,
                        )}
                      </span>
                      <h3>{product.name}</h3>
                      <div className="card-meta">
                        <span>{product.sku || "No SKU"}</span>
                        <strong>{priceLabel(product.price)}</strong>
                      </div>
                      <div className="card-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => setEditing(product)}
                        >
                          Edit product <span>↗</span>
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          aria-label={`Remove ${product.name} from demo`}
                          title="Remove from demo"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 3v7m4-7v7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {products && visible.length > PAGE_SIZE && (
              <div className="pagination">
                <span>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, visible.length)} of{" "}
                  {visible.length}
                </span>
                <div>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    ←
                  </button>
                  <span>
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(currentPage + 1)}
                    aria-label="Next page"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="admin-footnote">
            Maison Debrah Ethiopia · Product studio demonstration · No live
            catalog changes
          </p>
        </div>
      </main>
      {notice && (
        <div className="notice" role="status">
          <span>{notice.text}</span>
          {notice.undo && <button onClick={undoRemove}>Undo</button>}
          <button
            className="notice-close"
            aria-label="Dismiss message"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}
      {draftError && (
        <div className="draft-error" role="alert">
          {draftError}
          <button aria-label="Dismiss error" onClick={() => setDraftError("")}>
            ×
          </button>
        </div>
      )}
      {editing && (
        <ProductEditor
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? null : editing}
          products={products ?? []}
          onClose={() => setEditing(null)}
          onSave={saveProduct}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          product={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={removeProduct}
        />
      )}
    </div>
  );
}
