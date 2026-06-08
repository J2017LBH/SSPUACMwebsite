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

// SVG QR Code Placeholder Component
const qrCodeSVG = `
<svg class="qr-code-svg" width="160" height="160" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- QR Code Background -->
    <rect width="100" height="100" fill="#ffffff" rx="4"/>
    <!-- QR Finder Patterns (Top-Left, Top-Right, Bottom-Left) -->
    <!-- Top Left -->
    <rect x="10" y="10" width="25" height="25" fill="#090d16" />
    <rect x="14" y="14" width="17" height="17" fill="#ffffff" />
    <rect x="17" y="17" width="11" height="11" fill="#090d16" />
    <!-- Top Right -->
    <rect x="65" y="10" width="25" height="25" fill="#090d16" />
    <rect x="69" y="14" width="17" height="17" fill="#ffffff" />
    <rect x="72" y="17" width="11" height="11" fill="#090d16" />
    <!-- Bottom Left -->
    <rect x="10" y="65" width="25" height="25" fill="#090d16" />
    <rect x="14" y="69" width="17" height="17" fill="#ffffff" />
    <rect x="17" y="72" width="11" height="11" fill="#090d16" />
    
    <!-- Mock QR Dots / Data -->
    <rect x="42" y="10" width="4" height="8" fill="#090d16"/>
    <rect x="50" y="14" width="8" height="4" fill="#090d16"/>
    <rect x="42" y="22" width="12" height="4" fill="#090d16"/>
    
    <rect x="10" y="42" width="8" height="4" fill="#090d16"/>
    <rect x="22" y="42" width="4" height="8" fill="#090d16"/>
    <rect x="14" y="50" width="12" height="4" fill="#090d16"/>
    
    <rect x="42" y="42" width="8" height="8" fill="#3b82f6"/>
    <rect x="54" y="42" width="4" height="4" fill="#090d16"/>
    <rect x="50" y="50" width="8" height="8" fill="#10b981"/>
    
    <rect x="65" y="42" width="12" height="4" fill="#090d16"/>
    <rect x="81" y="42" width="8" height="8" fill="#090d16"/>
    <rect x="65" y="54" width="4" height="12" fill="#090d16"/>
    <rect x="73" y="50" width="8" height="4" fill="#090d16"/>
    
    <rect x="42" y="65" width="4" height="8" fill="#090d16"/>
    <rect x="50" y="69" width="12" height="4" fill="#090d16"/>
    <rect x="46" y="77" width="8" height="12" fill="#090d16"/>
    
    <rect x="65" y="65" width="8" height="8" fill="#090d16"/>
    <rect x="77" y="69" width="4" height="12" fill="#090d16"/>
    <rect x="69" y="81" width="12" height="8" fill="#090d16"/>
</svg>
`;

function injectHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

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
                    <li><a href="about.html" class="nav-link">关于协会</a></li>
                    <li><a href="hall_of_fame.html" class="nav-link">荣誉殿堂</a></li>
                    <li><a href="news.html" class="nav-link">动态公告</a></li>
                </ul>
                
                <div class="nav-actions">
                    <button class="theme-toggle-btn" id="theme-toggle" aria-label="切换主题">
                        <i class="fas fa-moon"></i>
                        <i class="fas fa-sun"></i>
                    </button>
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
                        <li><a href="about.html">关于我们</a></li>
                        <li><a href="hall_of_fame.html">荣誉殿堂</a></li>
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
                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 15px;">扫码加入二工大程序设计竞赛招新交流QQ群，开启算法之旅！</p>
                    <div style="width: 120px; height: 120px; background: white; padding: 6px; border-radius: 8px;">
                        ${qrCodeSVG}
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
                ${qrCodeSVG}
                <p style="margin-top: 10px;">扫码加入招新QQ群</p>
                <span>群号: [待配置留白]</span>
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
