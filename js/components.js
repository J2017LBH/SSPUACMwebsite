/* 
 * Reusable Components Loader - Header & Footer Injections
 * Author: Antigravity
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    setActiveNavLink();
});

// Official Logo Component (SSPU ACM)
const logoSVG = `
<img src="images/logo.jpg" alt="SSPU ACM Logo" class="sspu-logo-img" style="height: 40px; width: auto; border-radius: 6px; display: block;" />
`;

function injectHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');

    const headerHTML = `
    <header id="main-header">
        <div class="container">
            <nav class="navbar">
                <a href="index.html" class="logo">
                    ${logoSVG}
                    <span>SSPU ACM</span>
                </a>
                
                <ul class="nav-menu" id="nav-menu">
                    <li><a href="index.html" class="nav-link">首页</a></li>
                    <li><a href="about.html" class="nav-link">关于 XCPC</a></li>
                    <li><a href="hall_of_fame.html" class="nav-link">荣誉殿堂</a></li>
                    <li><a href="xcpc.html" class="nav-link">XCPC 积分</a></li>
                    <li><a href="lanqiao.html" class="nav-link">蓝桥杯</a></li>
                    <li><a href="news.html" class="nav-link">动态公告</a></li>
                </ul>
                
                <div class="nav-actions">
                    <button class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="打开菜单">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </nav>
        </div>
    </header>
    `;
    
    headerPlaceholder.outerHTML = headerHTML;
}

function injectFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    const footerHTML = `
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="logo">
                        ${logoSVG}
                        <span>SSPU ACM</span>
                    </div>
                    <p>上海第二工业大学程序设计竞赛协会（SSPU ACM）汇聚编程热爱者，提供专业算法学习平台，出战ICPC/CCPC等全国顶级计算机赛事。</p>
                    <div style="display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.95rem; margin-top: 12px;">
                        <i class="fas fa-envelope" style="color: var(--primary-color);"></i>
                        <span>联系邮箱：2914271809@qq.com</span>
                    </div>
                </div>
                
                <div class="footer-col">
                    <h4>导航</h4>
                    <ul>
                        <li><a href="index.html">首页</a></li>
                        <li><a href="about.html">关于 XCPC</a></li>
                        <li><a href="hall_of_fame.html">荣誉殿堂</a></li>
                        <li><a href="xcpc.html">XCPC 积分</a></li>
                        <li><a href="news.html">动态公告</a></li>
                    </ul>
                </div>
                
                <div class="footer-col">
                    <h4>友情链接</h4>
                    <ul>
                        <li><a href="https://luogu.com.cn" target="_blank">洛谷 (Luogu)</a></li>
                        <li><a href="https://codeforces.com" target="_blank">Codeforces</a></li>
                        <li><a href="https://atcoder.jp" target="_blank">AtCoder</a></li>
                        <li><a href="https://ac.nowcoder.com" target="_blank">牛客竞赛 (Nowcoder)</a></li>
                        <li><a href="https://rl.algoux.cn/" target="_blank">Rankland</a></li>
                    </ul>
                </div>
                
                <div class="footer-col">
                    <h4>加入我们</h4>
                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 15px;">欢迎加入二工大程序设计竞赛招新交流QQ群，开启算法之旅！</p>
                    <div style="color: var(--text-color); font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-top: 10px;">
                        <i class="fab fa-qq" style="color: var(--primary-color); font-size: 1.2rem;"></i>
                        <span>QQ群号：882805900</span>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2026 上海第二工业大学程序设计竞赛协会. All Rights Reserved.</p>
                <p>Designed with <i class="fas fa-heart" style="color: #e11d48;"></i> by J2017LBH</p>
            </div>
        </div>
        
        <!-- Join Us Floating Button -->
        <div class="floating-join">
            <span>加入<br>我们</span>
            <div class="join-qrcode-popup">
                <i class="fab fa-qq" style="font-size: 2.2rem; color: var(--primary-color); margin-bottom: 10px; display: block;"></i>
                <p style="font-size: 0.95rem; font-weight: 700; margin-bottom: 5px;">招新交流群</p>
                <span style="font-size: 1.1rem; color: var(--accent-color); font-weight: 700; display: block; margin-top: 5px;">882805900</span>
            </div>
        </div>
    </footer>
    `;

    footerPlaceholder.outerHTML = footerHTML;
}

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
