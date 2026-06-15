/* XCPC Rating Page - Data Loading & Rendering */

(function () {
    'use strict';

    const DATA_URL = 'data/sspu-data.json';
    let allData = null;
    let currentLb = 'all'; // 'all' or 'official'
    let currentSort = 'rating'; // 'rating' or 'medals'

    const MEDAL_TIER_WEIGHT = { regional: 3, invitational: 2, provincial: 1 };
    const MEDAL_WEIGHT = { gold: 300, silver: 20, bronze: 1 };

    /* ---- Data Loading ---- */

    async function loadData() {
        try {
            const resp = await fetch(DATA_URL);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            allData = await resp.json();
            renderStats();
            renderPlayers();
            renderContests();
            bindEvents();
        } catch (err) {
            console.error('Failed to load SSPU data:', err);
            document.querySelector('.xcpc-main').innerHTML =
                '<div class="container" style="text-align:center;padding:4rem 0;color:var(--text-muted);">' +
                '<i class="fas fa-circle-exclamation" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>' +
                '<p>数据加载失败，请确认 data/sspu-data.json 存在。</p></div>';
        }
    }

    /* ---- Stats ---- */

    function renderStats() {
        const s = allData.stats;
        document.getElementById('stat-players').textContent = s.totalPlayers;
        document.getElementById('stat-contests').textContent = s.totalContests;
        document.getElementById('stat-top-rating').textContent = s.topRating.toFixed(0);
        const medalTotal = s.totalMedals.gold + s.totalMedals.silver + s.totalMedals.bronze;
        document.getElementById('stat-medals').textContent = medalTotal;
    }

    /* ---- Players ---- */

    function getRatingTierClass(rating) {
        if (rating >= 2000) return 'xcpc-rating-tier-1';
        if (rating >= 1800) return 'xcpc-rating-tier-2';
        if (rating >= 1600) return 'xcpc-rating-tier-3';
        if (rating >= 1400) return 'xcpc-rating-tier-4';
        if (rating >= 1200) return 'xcpc-rating-tier-5';
        return 'xcpc-rating-tier-6';
    }

    function renderMedals(medals) {
        if (!medals) return '<span class="xcpc-medals" style="color:var(--text-muted);">—</span>';
        let g = 0, s = 0, b = 0;
        for (const tier of Object.values(medals)) {
            if (tier && typeof tier === 'object') {
                g += tier.gold || 0;
                s += tier.silver || 0;
                b += tier.bronze || 0;
            }
        }
        if (g === 0 && s === 0 && b === 0) return '<span class="xcpc-medals" style="color:var(--text-muted);">—</span>';
        let html = '<span class="xcpc-medals">';
        if (g > 0) html += `<span class="xcpc-medal-gold"><i class="fas fa-medal"></i>×${g}</span>`;
        if (s > 0) html += `<span class="xcpc-medal-silver"><i class="fas fa-medal"></i>×${s}</span>`;
        if (b > 0) html += `<span class="xcpc-medal-bronze"><i class="fas fa-medal"></i>×${b}</span>`;
        html += '</span>';
        return html;
    }

    function medalScore(medals) {
        if (!medals) return 0;
        let score = 0;
        for (const [tier, counts] of Object.entries(medals)) {
            if (!counts || typeof counts !== 'object') continue;
            const tierW = MEDAL_TIER_WEIGHT[tier] || 0;
            score += tierW * ((counts.gold || 0) * MEDAL_WEIGHT.gold + (counts.silver || 0) * MEDAL_WEIGHT.silver + (counts.bronze || 0) * MEDAL_WEIGHT.bronze);
        }
        return score;
    }

    function renderPlayers(filter) {
        const tbody = document.getElementById('players-tbody');
        let players = currentLb === 'official'
            ? buildOfficialPlayers()
            : [...allData.players];

        if (currentSort === 'medals') {
            players.sort((a, b) => medalScore(b.medals) - medalScore(a.medals) || b.rating - a.rating);
            players.forEach((p, i) => p.rank = i + 1);
        }

        if (filter) {
            const q = filter.toLowerCase();
            players = players.filter(p => p.name.toLowerCase().includes(q));
        }

        tbody.innerHTML = players.map(p => {
            const rating = currentLb === 'official' ? (p.ratingOfficial || p.rating) : p.rating;
            const rankClass = p.rank <= 3 ? `xcpc-rank-${p.rank}` : 'xcpc-rank-normal';
            const tierClass = getRatingTierClass(rating);
            return `<tr>
                <td class="col-rank"><span class="xcpc-rank ${rankClass}">${p.rank}</span></td>
                <td class="col-name"><strong>${escapeHtml(p.name)}</strong></td>
                <td class="col-rating"><span class="xcpc-rating ${tierClass}">${rating.toFixed(1)}</span></td>
                <td class="col-contests">${p.contests}</td>
                <td class="col-medals">${renderMedals(p.medals)}</td>
                <td class="col-action"><button class="xcpc-view-btn" data-key="${escapeAttr(p.key)}"><i class="fas fa-chart-line"></i></button></td>
            </tr>`;
        }).join('');
    }

    function buildOfficialPlayers() {
        return allData.players.map(p => ({
            ...p,
            rating: p.ratingOfficial || p.rating,
        })).sort((a, b) => b.rating - a.rating).map((p, i) => ({ ...p, rank: i + 1 }));
    }

    /* ---- Contests ---- */

    function getCategoryClass(cat) {
        const map = { icpc: 'xcpc-cat-icpc', ccpc: 'xcpc-cat-ccpc', provincial: 'xcpc-cat-provincial' };
        return map[cat] || '';
    }

    function getCategoryLabel(cat) {
        const map = { icpc: 'ICPC', ccpc: 'CCPC', provincial: '省赛' };
        return map[cat] || cat.toUpperCase();
    }

    function renderContests() {
        const tbody = document.getElementById('contests-tbody');
        tbody.innerHTML = allData.contests.map(c => {
            const bestRank = Math.min(...c.sspuTeams.map(t => t.rank));
            const date = c.startAt.slice(0, 10);
            return `<tr>
                <td class="col-date">${date}</td>
                <td class="col-contest-name">${escapeHtml(c.title)}</td>
                <td class="col-category"><span class="xcpc-category ${getCategoryClass(c.category)}">${getCategoryLabel(c.category)}</span></td>
                <td class="col-sspu-teams">${c.sspuTeams.length}</td>
                <td class="col-best-rank"><strong>${bestRank}</strong> / ${c.teamCount}</td>
            </tr>`;
        }).join('');
    }

    /* ---- Player Detail Modal ---- */

    let chartInstance = null;
    let resizeObserver = null;

    function openPlayerModal(key) {
        const player = allData.players.find(p => p.key === key);
        if (!player) return;

        const history = allData.playerDetails[key] || [];
        const modal = document.getElementById('player-modal');

        document.getElementById('modal-player-name').textContent = player.name;
        document.getElementById('modal-player-org').innerHTML = `<i class="fas fa-school"></i> ${escapeHtml(player.org)}`;
        document.getElementById('modal-player-rating').innerHTML = `<i class="fas fa-chart-line"></i> 积分 ${player.rating.toFixed(1)}`;
        document.getElementById('modal-player-contests').innerHTML = `<i class="fas fa-flag"></i> ${player.contests} 场比赛`;

        // History table
        const htbody = document.getElementById('modal-history-tbody');
        const sortedHistory = [...history].sort((a, b) => a.startAt.localeCompare(b.startAt));
        htbody.innerHTML = sortedHistory.map(h => {
            const date = h.startAt.slice(0, 10);
            const perf = h.perf != null ? h.perf.toFixed(0) : '—';
            const ratingAfter = h.rating_after != null ? h.rating_after.toFixed(1) : '—';
            return `<tr>
                <td>${date}</td>
                <td>${escapeHtml(h.title)}</td>
                <td>${escapeHtml(h.teamName)}</td>
                <td>${h.rank} / ${h.teamCount}</td>
                <td>${perf}</td>
                <td><strong>${ratingAfter}</strong></td>
            </tr>`;
        }).join('');

        // Chart
        renderRatingChart(sortedHistory);

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closePlayerModal() {
        const modal = document.getElementById('player-modal');
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
        if (chartInstance) {
            chartInstance.dispose();
            chartInstance = null;
        }
    }

    function renderRatingChart(history) {
        const container = document.getElementById('rating-chart');
        if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
        if (chartInstance) chartInstance.dispose();
        chartInstance = echarts.init(container);

        const ratedHistory = history.filter(h => h.rating_after != null);
        const dates = ratedHistory.map(h => h.startAt.slice(0, 10));
        const ratings = ratedHistory.map(h => h.rating_after);
        const perfs = ratedHistory.map(h => h.perf != null ? h.perf : null);
        const titles = ratedHistory.map(h => h.title);

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                textStyle: { color: '#f8fafc', fontSize: 12 },
                formatter: function (params) {
                    const idx = params[0].dataIndex;
                    let html = `<strong>${titles[idx]}</strong><br/>${dates[idx]}<br/>`;
                    html += `积分: <span style="color:#3b82f6;font-weight:700">${ratings[idx].toFixed(1)}</span>`;
                    if (perfs[idx] != null) {
                        html += `<br/>表现分: <span style="color:#10b981">${perfs[idx].toFixed(0)}</span>`;
                    }
                    return html;
                },
            },
            grid: { left: 50, right: 20, top: 20, bottom: 30 },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 30 },
                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            },
            yAxis: {
                type: 'value',
                name: '积分',
                nameTextStyle: { color: '#94a3b8' },
                axisLabel: { color: '#94a3b8' },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
            },
            series: [
                {
                    name: '积分',
                    type: 'line',
                    data: ratings,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { color: '#3b82f6', width: 2 },
                    itemStyle: { color: '#3b82f6' },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                            { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
                        ]),
                    },
                },
                {
                    name: '表现分',
                    type: 'line',
                    data: perfs,
                    smooth: true,
                    symbol: 'diamond',
                    symbolSize: 5,
                    lineStyle: { color: '#10b981', width: 1.5, type: 'dashed' },
                    itemStyle: { color: '#10b981' },
                },
            ],
        };

        chartInstance.setOption(option);

        // Resize handler
        resizeObserver = new ResizeObserver(() => chartInstance.resize());
        resizeObserver.observe(container);
    }

    /* ---- Event Binding ---- */

    function bindEvents() {
        // Tab switching
        document.querySelectorAll('.xcpc-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.xcpc-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.xcpc-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
            });
        });

        // Leaderboard toggle
        document.querySelectorAll('.xcpc-lb-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.xcpc-lb-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentLb = btn.dataset.lb;
                renderPlayers(document.getElementById('player-search').value);
            });
        });

        // Sort select
        document.getElementById('player-sort').addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderPlayers(document.getElementById('player-search').value);
        });

        // Search
        document.getElementById('player-search').addEventListener('input', (e) => {
            renderPlayers(e.target.value);
        });

        // Player detail click (delegated)
        document.getElementById('players-tbody').addEventListener('click', (e) => {
            const btn = e.target.closest('.xcpc-view-btn');
            if (btn) openPlayerModal(btn.dataset.key);
        });

        // Modal close
        document.getElementById('modal-close').addEventListener('click', closePlayerModal);
        document.getElementById('player-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closePlayerModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePlayerModal();
        });
    }

    /* ---- Utilities ---- */

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* ---- Init ---- */
    document.addEventListener('DOMContentLoaded', loadData);
})();
