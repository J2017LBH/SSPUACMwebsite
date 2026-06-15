/**
 * 蓝桥杯获奖数据页面逻辑
 * 加载 data/lanqiao-sspu.json，渲染统计、排行、筛选、详情
 */

const PAGE_SIZE = 20;
const MIN_EDITION = 13; // 排行从十三届开始统计
let allPersons = [];
let filteredPersons = [];
let currentPage = 1;
let sortKey = "default";
let sortAsc = false;

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initLanqiaoPage, 50);
});

// 计算十三届及之后的奖项统计（用于排行）
function computeRankingStats(person) {
  const stats = { nationalFirst: 0, nationalSecond: 0, nationalThird: 0, provincialFirst: 0, provincialSecond: 0, provincialThird: 0, total: 0 };
  for (const r of (person.records || [])) {
    if (r.edition < MIN_EDITION) continue;
    const isNational = r.scopeCode === 2;
    if (r.awardCode <= 1) {
      if (isNational) stats.nationalFirst++;
      else stats.provincialFirst++;
      stats.total++;
    } else if (r.awardCode === 2) {
      if (isNational) stats.nationalSecond++;
      else stats.provincialSecond++;
      stats.total++;
    } else if (r.awardCode === 3) {
      if (isNational) stats.nationalThird++;
      else stats.provincialThird++;
      stats.total++;
    }
  }
  return stats;
}

async function initLanqiaoPage() {
  try {
    const res = await fetch("data/lanqiao-sspu.json");
    const data = await res.json();

    // 为每个人计算十三届之后的排行数据，过滤掉十三届后无获奖记录的人
    allPersons = data.persons.map(p => {
      const rk = computeRankingStats(p);
      return { ...p, rk };
    }).filter(p => p.rk.total > 0);

    filteredPersons = [...allPersons];

    renderStats(data.stats); // 统计卡片用总体数据
    renderEditionOptions(data.stats.byEdition);
    renderTable();
    bindEvents();
  } catch (err) {
    console.error("加载蓝桥杯数据失败:", err);
  }
}

// ---------- 统计卡片 ----------
function renderStats(stats) {
  const grid = document.getElementById("lanqiao-stats");
  if (!grid) return;

  const cards = [
    { icon: "fas fa-users", value: stats.totalContestants, label: "参赛选手" },
    { icon: "fas fa-trophy", value: stats.nationalFirst + stats.nationalSecond + stats.nationalThird, label: "国奖总数" },
    { icon: "fas fa-medal", value: stats.provincialFirst + stats.provincialSecond + stats.provincialThird, label: "省奖总数" },
    { icon: "fas fa-star", value: stats.nationalFirst, label: "国家一等奖" },
    { icon: "fas fa-award", value: stats.provincialFirst, label: "省级一等奖" },
    { icon: "fas fa-chart-bar", value: stats.totalRecords, label: "获奖记录" },
  ];

  grid.innerHTML = cards.map(c => `
    <div class="stat-card glass-card">
      <i class="${c.icon}"></i>
      <div class="stat-number">${c.value}</div>
      <div class="stat-label">${c.label}</div>
    </div>
  `).join("");
}

// ---------- 届次筛选选项 ----------
function renderEditionOptions(byEdition) {
  const select = document.getElementById("lanqiao-edition-filter");
  if (!select) return;

  const editions = Object.keys(byEdition).sort((a, b) => {
    const na = parseInt(a.replace(/[^0-9]/g, ""));
    const nb = parseInt(b.replace(/[^0-9]/g, ""));
    return nb - na;
  });

  for (const ed of editions) {
    const opt = document.createElement("option");
    opt.value = ed;
    opt.textContent = `${ed} (${byEdition[ed].total}项)`;
    select.appendChild(opt);
  }
}

// ---------- 排序（排行数据从十三届开始） ----------
const SORT_PRIORITY = ["nationalFirst", "nationalSecond", "nationalThird", "provincialFirst", "provincialSecond", "provincialThird", "total"];

function comparePersons(a, b, key, asc) {
  if (key === "default") {
    for (const k of SORT_PRIORITY) {
      const diff = (b.rk[k] || 0) - (a.rk[k] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }
  const va = a.rk[key] || 0;
  const vb = b.rk[key] || 0;
  return asc ? va - vb : vb - va;
}

function sortPersons() {
  filteredPersons.sort((a, b) => comparePersons(a, b, sortKey, sortAsc));
}

// ---------- 表格渲染 ----------
function renderTable() {
  const tbody = document.getElementById("lanqiao-body");
  if (!tbody) return;

  sortPersons();

  const start = (currentPage - 1) * PAGE_SIZE;
  const page = filteredPersons.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = page.map((p, i) => `
    <tr>
      <td>${start + i + 1}</td>
      <td><strong>${escHtml(p.name)}</strong></td>
      <td>${p.rk.nationalFirst || "-"}</td>
      <td>${p.rk.nationalSecond || "-"}</td>
      <td>${p.rk.nationalThird || "-"}</td>
      <td>${p.rk.provincialFirst || "-"}</td>
      <td>${p.rk.provincialSecond || "-"}</td>
      <td>${p.rk.provincialThird || "-"}</td>
      <td><strong>${p.rk.total}</strong></td>
      <td><button class="btn-detail" data-pid="${p.pid}"><i class="fas fa-eye"></i></button></td>
    </tr>
  `).join("");

  renderPagination();
}

// ---------- 分页 ----------
function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(filteredPersons.length / PAGE_SIZE));
  const summary = document.getElementById("lanqiao-page-summary");
  const info = document.getElementById("lanqiao-page-info");
  const prev = document.getElementById("lanqiao-prev");
  const next = document.getElementById("lanqiao-next");

  if (summary) summary.textContent = `共 ${filteredPersons.length} 名选手`;
  if (info) info.textContent = `${currentPage} / ${totalPages}`;
  if (prev) prev.disabled = currentPage <= 1;
  if (next) next.disabled = currentPage >= totalPages;
}

// ---------- 筛选 ----------
function applyFilters() {
  const query = (document.getElementById("lanqiao-search")?.value || "").trim().toLowerCase();
  const edition = document.getElementById("lanqiao-edition-filter")?.value || "";
  const award = document.getElementById("lanqiao-award-filter")?.value || "";

  filteredPersons = allPersons.filter(p => {
    if (query && !p.name.toLowerCase().includes(query)) return false;
    if (award && (p.rk[award] || 0) === 0) return false;
    if (edition) {
      const hasEdition = (p.records || []).some(r => r.editionLabel === edition);
      if (!hasEdition) return false;
    }
    return true;
  });

  currentPage = 1;
  renderTable();
}

// ---------- 选手详情模态 ----------
function showDetail(pid) {
  const person = allPersons.find(p => p.pid === Number(pid));
  if (!person) return;

  const modal = document.getElementById("lanqiao-modal");
  const nameEl = document.getElementById("modal-name");
  const statsEl = document.getElementById("modal-stats");
  const recordsEl = document.getElementById("modal-records");

  if (nameEl) nameEl.textContent = person.name;

  if (statsEl) {
    const items = [
      { label: "国一", value: person.nationalFirst },
      { label: "国二", value: person.nationalSecond },
      { label: "国三", value: person.nationalThird },
      { label: "省一", value: person.provincialFirst },
      { label: "省二", value: person.provincialSecond },
      { label: "省三", value: person.provincialThird },
    ];
    statsEl.innerHTML = items.map(i =>
      `<div class="stat-mini"><strong>${i.value || 0}</strong><span>${i.label}</span></div>`
    ).join("");
  }

  if (recordsEl) {
    const records = (person.records || []).slice().sort((a, b) => b.edition - a.edition);
    recordsEl.innerHTML = records.map(r => {
      const awardClass = r.awardCode <= 1 ? "award-gold" : r.awardCode === 2 ? "award-silver" : "award-bronze";
      return `
        <tr>
          <td>${r.editionLabel}</td>
          <td>${escHtml(r.scope)}</td>
          <td>${escHtml(r.province || "-")}</td>
          <td>${r.rank || "-"}</td>
          <td>${escHtml(r.subject || "-")}</td>
          <td><span class="award-badge ${awardClass}">${escHtml(r.award)}</span></td>
        </tr>
      `;
    }).join("");
  }

  if (modal) modal.style.display = "flex";
}

function hideDetail() {
  const modal = document.getElementById("lanqiao-modal");
  if (modal) modal.style.display = "none";
}

// ---------- 事件绑定 ----------
function bindEvents() {
  // 搜索
  const searchInput = document.getElementById("lanqiao-search");
  if (searchInput) {
    let timer;
    searchInput.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(applyFilters, 300);
    });
  }

  // 筛选下拉
  document.getElementById("lanqiao-edition-filter")?.addEventListener("change", applyFilters);
  document.getElementById("lanqiao-award-filter")?.addEventListener("change", applyFilters);

  // 分页
  document.getElementById("lanqiao-prev")?.addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderTable(); }
  });
  document.getElementById("lanqiao-next")?.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredPersons.length / PAGE_SIZE);
    if (currentPage < totalPages) { currentPage++; renderTable(); }
  });

  // 排序
  document.querySelectorAll(".sortable").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortAsc = !sortAsc;
      } else {
        sortKey = key;
        sortAsc = false;
      }
      currentPage = 1;
      renderTable();
    });
  });

  // 详情按钮
  document.getElementById("lanqiao-body")?.addEventListener("click", e => {
    const btn = e.target.closest(".btn-detail");
    if (btn) showDetail(btn.dataset.pid);
  });

  // 关闭模态框
  document.getElementById("modal-close")?.addEventListener("click", hideDetail);
  document.getElementById("lanqiao-modal")?.addEventListener("click", e => {
    if (e.target.id === "lanqiao-modal") hideDetail();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") hideDetail();
  });
}

// ---------- 工具函数 ----------
function escHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}
