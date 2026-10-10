(() => {
  "use strict";
  const STORAGE_KEY = "barangBawaanku.v1";
  const $ = id => document.getElementById(id);
  let items = loadItems();
  let toastTimer;

  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(x => x && typeof x === "object" && x.id && x.name) : [];
    } catch (e) { return []; }
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (e) {
      notify("Penyimpanan penuh atau diblokir. Ekspor cadangan data Anda.");
      return false;
    }
  }
  function notify(message) {
    const el = $("toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
  }
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function makeId() { return (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function render() {
    const q = $("searchInput").value.trim().toLocaleLowerCase("id");
    const status = $("filterStatus").value;
    const ready = items.filter(x => x.done).length;
    $("totalCount").textContent = items.length;
    $("readyCount").textContent = ready;
    $("pendingCount").textContent = items.length - ready;
    const shown = items.filter(x => {
      const matches = [x.name,x.category,x.location,x.notes].some(v => String(v || "").toLocaleLowerCase("id").includes(q));
      return matches && (status === "semua" || (status === "siap" ? x.done : !x.done));
    });
    $("resultCount").textContent = `${shown.length} barang`;
    $("emptyState").classList.toggle("hidden", shown.length !== 0);
    $("itemList").innerHTML = shown.map(x => `
      <article class="item-card ${x.done ? "done" : ""}">
        <input class="check" type="checkbox" aria-label="Tandai ${esc(x.name)} sudah dibawa" data-action="toggle" data-id="${esc(x.id)}" ${x.done ? "checked" : ""}>
        <div>
          <div class="item-name">${esc(x.name)}</div>
          <div class="meta"><span class="pill">${esc(x.category || "Lainnya")}</span><span class="pill">${esc(x.quantity)} ${esc(x.unit || "buah")}</span><span class="pill ${x.done ? "ready" : ""}">${x.done ? "Sudah dibawa" : "Belum dibawa"}</span></div>
          ${x.location ? `<div class="details">📍 ${esc(x.location)}</div>` : ""}
          ${x.notes ? `<div class="details">Catatan: ${esc(x.notes)}</div>` : ""}
        </div>
        <div class="item-actions">
          <button type="button" class="icon-btn" data-action="edit" data-id="${esc(x.id)}">Edit</button>
          <button type="button" class="icon-btn delete-btn" data-action="delete" data-id="${esc(x.id)}">Hapus</button>
        </div>
      </article>`).join("");
  }

  function resetForm() {
    $("itemForm").reset(); $("itemId").value = ""; $("quantity").value = "1";
    $("formTitle").textContent = "Tambah barang"; $("saveButton").textContent = "Simpan barang";
    $("cancelEdit").classList.add("hidden");
  }
  $("itemForm").addEventListener("submit", event => {
    event.preventDefault();
    const id = $("itemId").value;
    const old = items.find(x => x.id === id);
    const item = {
      id: id || makeId(),
      name: $("name").value.trim(),
      category: $("category").value,
      quantity: Math.max(1, Math.min(9999, Number.parseInt($("quantity").value, 10) || 1)),
      unit: $("unit").value.trim(),
      location: $("location").value.trim(),
      notes: $("notes").value.trim(),
      done: old ? Boolean(old.done) : false,
      updatedAt: new Date().toISOString()
    };
    if (!item.name) { notify("Nama barang wajib diisi."); return; }
    if (old) items = items.map(x => x.id === id ? item : x);
    else items.unshift(item);
    persist(); resetForm(); render(); notify(old ? "Barang berhasil diperbarui." : "Barang berhasil ditambahkan.");
  });
  $("cancelEdit").addEventListener("click", resetForm);
  $("searchInput").addEventListener("input", render);
  $("filterStatus").addEventListener("change", render);

  $("itemList").addEventListener("click", event => {
    const btn = event.target.closest("[data-action]");
    if (!btn || btn.dataset.action === "toggle") return;
    const item = items.find(x => x.id === btn.dataset.id);
    if (!item) return;
    if (btn.dataset.action === "edit") {
      $("itemId").value = item.id; $("name").value = item.name; $("category").value = item.category || "Lainnya";
      $("quantity").value = item.quantity || 1; $("unit").value = item.unit || ""; $("location").value = item.location || ""; $("notes").value = item.notes || "";
      $("formTitle").textContent = "Edit barang"; $("saveButton").textContent = "Simpan perubahan"; $("cancelEdit").classList.remove("hidden");
      window.scrollTo({top: 0, behavior: "smooth"}); $("name").focus();
    } else if (btn.dataset.action === "delete") {
      if (!confirm(`Hapus "${item.name}" dari daftar?`)) return;
      items = items.filter(x => x.id !== item.id); persist(); render(); notify("Barang dihapus.");
    }
  });
  $("itemList").addEventListener("change", event => {
    const el = event.target;
    if (el.dataset.action !== "toggle") return;
    items = items.map(x => x.id === el.dataset.id ? {...x, done: el.checked, updatedAt: new Date().toISOString()} : x);
    persist(); render();
  });

  $("exportButton").addEventListener("click", () => {
    const data = {app: "Barang Bawaanku", version: 1, exportedAt: new Date().toISOString(), items};
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `cadangan-barang-bawaan-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    notify("File cadangan dibuat.");
  });
  $("importInput").addEventListener("change", async event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const incoming = Array.isArray(parsed) ? parsed : parsed.items;
      if (!Array.isArray(incoming) || !incoming.every(x => x && typeof x.name === "string")) throw new Error("format");
      const clean = incoming.map(x => ({
        id: String(x.id || makeId()), name: String(x.name).slice(0,100),
        category: String(x.category || "Lainnya").slice(0,60),
        quantity: Math.max(1, Math.min(9999, Number.parseInt(x.quantity,10) || 1)),
        unit: String(x.unit || "").slice(0,30), location: String(x.location || "").slice(0,100),
        notes: String(x.notes || "").slice(0,1000), done: Boolean(x.done),
        updatedAt: x.updatedAt || new Date().toISOString()
      }));
      if (!confirm(`Impor ${clean.length} barang? Pilih OK untuk menambahkan/memperbarui barang berdasarkan ID. Barang yang tidak ada di file tidak dihapus.`)) return;
      const map = new Map(items.map(x => [x.id, x]));
      clean.forEach(x => map.set(x.id, x)); items = Array.from(map.values());
      persist(); render(); notify(`${clean.length} barang berhasil diimpor.`);
    } catch (e) { notify("File cadangan tidak valid atau tidak bisa dibaca."); }
    finally { event.target.value = ""; }
  });

  render();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();