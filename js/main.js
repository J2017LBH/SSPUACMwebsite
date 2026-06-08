/* 
 * Main Interactive Features & Animation Script
 * Author: Antigravity
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait slightly for components to be injected in components.js
    setTimeout(() => {
        initThemeToggle();
        initMobileNav();
        initHeaderScroll();
        initParallax();
        initTypewriter();
        initSlideshow();
        initStatsCounter();
    }, 50);
});

// 1. Theme Toggle Controller
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Toggle click event
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Dispatches event in case other components need to react
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
    });
}

// 2. Mobile Menu Controller
function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });
}

// 3. Header Scroll Effect
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run initially
}

// 4. Parallax Effect for Floating Code
function initParallax() {
    const heroSection = document.querySelector('.hero-section');
    const floatingElements = document.querySelectorAll('.floating-code');
    if (!heroSection || floatingElements.length === 0) return;

    heroSection.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Calculate offsets relative to center
        const xOffset = (clientX - width / 2) / (width / 2);
        const yOffset = (clientY - height / 2) / (height / 2);

        floatingElements.forEach((el, index) => {
            // Give different factors to elements for a 3D depth effect
            const depthFactor = (index + 1) * 20;
            const xTranslation = xOffset * depthFactor;
            const yTranslation = yOffset * depthFactor;
            
            // Adjust original floating animation with parallax translate
            el.style.transform = `translate(${xTranslation}px, ${yTranslation}px)`;
        });
    });

    // Reset offsets on mouse leave
    heroSection.addEventListener('mouseleave', () => {
        floatingElements.forEach(el => {
            el.style.transform = 'translate(0px, 0px)';
        });
    });
}

// 5. Typewriter Effect
function initTypewriter() {
    const textElement = document.getElementById('typewriter-text');
    if (!textElement) return;

    const phrases = ["写码筑梦，竞创未来。", "上海第二工业大学程序设计竞赛协会", "用算法改变世界，用代码书写青春。"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 150;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000; // Wait before starting to delete
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Wait before writing next phrase
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

// 6. Image Slideshow
function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;

    let slideIndex = 0;
    let slideTimer;

    function showSlides(index) {
        if (index >= slides.length) slideIndex = 0;
        if (index < 0) slideIndex = slides.length - 1;

        slides.forEach(slide => slide.style.display = "none");
        dots.forEach(dot => dot.classList.remove("active"));

        slides[slideIndex].style.display = "block";
        if (dots[slideIndex]) {
            dots[slideIndex].classList.add("active");
        }
    }

    function startTimer() {
        slideTimer = setInterval(() => {
            slideIndex++;
            showSlides(slideIndex);
        }, 5000); // Change image every 5 seconds
    }

    function resetTimer() {
        clearInterval(slideTimer);
        startTimer();
    }

    // Bind dots click events
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            slideIndex = idx;
            showSlides(slideIndex);
            resetTimer();
        });
    });

    // Initialize
    showSlides(slideIndex);
    startTimer();
}

// 7. Stats Number Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length === 0) return;

    const options = {
        threshold: 0.5,
        rootMargin: "0px 0px -50px 0px"
    };

    const countUp = (entry) => {
        const target = entry.target;
        const targetNum = parseInt(target.getAttribute('data-target'), 10);
        const suffix = target.getAttribute('data-suffix') || '';
        let currentNum = 0;
        const duration = 1500; // Total count duration in ms
        const stepTime = Math.max(Math.floor(duration / targetNum), 15);
        
        const timer = setInterval(() => {
            currentNum += Math.ceil(targetNum / (duration / stepTime));
            if (currentNum >= targetNum) {
                target.textContent = targetNum + suffix;
                clearInterval(timer);
            } else {
                target.textContent = currentNum + suffix;
            }
        }, stepTime);
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry);
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, options);

    statNumbers.forEach(num => {
        observer.observe(num);
    });
}
