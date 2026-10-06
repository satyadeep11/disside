/**
 * ============================================================================
 * DISSIDE MODULAR COMPONENT LOADER & INTERACTIVE CONTROLLER
 * Loads header & footer dynamically, normalizes relative paths, binds nav logic
 * ============================================================================
 */

(function () {
  'use strict';

  // Determine if current document is nested inside /pages/
  const isPagesSubdir = (function () {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/')) return true;
    
    // Check if currentScript path was relative from pages/
    if (document.currentScript && document.currentScript.src) {
      if (document.currentScript.src.includes('../assets/js/components.js')) return true;
    }
    
    // Check relative path of stylesheets or links
    const luxuryCssLink = document.querySelector('link[href*="luxury.css"]');
    if (luxuryCssLink && luxuryCssLink.getAttribute('href').startsWith('../')) {
      return true;
    }
    
    return false;
  })();

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const prefix = isPagesSubdir ? '../' : './';
  const headerUrl = prefix + 'components/header.html';
  const footerUrl = prefix + 'components/footer.html';

  /**
   * Adjust relative paths in loaded HTML string based on directory level
   */
  function normalizeHtmlPaths(html) {
    if (isPagesSubdir) {
      // We are in pages/*.html
      return html
        // Replace asset links
        .replace(/src="assets\//g, 'src="../assets/')
        .replace(/href="assets\//g, 'href="../assets/')
        // Replace sitemap link
        .replace(/href="sitemap\.xml"/g, 'href="../sitemap.xml"')
        // Replace root index.html links
        .replace(/href="index\.html(#?[^"]*)"/g, 'href="../index.html$1"')
        // Replace links to pages/xxx with xxx
        .replace(/href="pages\/([^"]+)"/g, 'href="$1"');
    } else {
      // We are at root index.html
      return html
        // On home page, index.html#section becomes #section for smooth in-page scrolling
        .replace(/href="index\.html#([^"]+)"/g, 'href="#$1"');
    }
  }

  /**
   * Highlight active nav link and active dropdown item
   */
  function highlightActiveNavigation(headerEl) {
    const pageName = currentPath;
    
    // Find all nav links
    const navLinks = headerEl.querySelectorAll('[data-nav-link], .nav-link, .mobile-nav-link');
    
    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const dataLink = link.getAttribute('data-nav-link') || '';
      
      const isMatch = (dataLink && dataLink === pageName) ||
                      (href.endsWith(pageName) && pageName !== 'index.html') ||
                      (pageName === 'index.html' && (href === 'index.html' || href === '#our-story' || href === './'));

      if (isMatch) {
        link.classList.add('text-amber-300', 'font-bold');
        if (link.classList.contains('nav-link') && !link.closest('.group')) {
          link.classList.add('border-b-2', 'border-amber-400', 'pb-1');
        }
      }
    });

    // If on a service subpage, mark the Services parent trigger as active
    if (pageName.includes('service') || pageName.includes('strategy') || pageName.includes('identity') || pageName.includes('packaging') || pageName.includes('rebranding') || pageName.includes('scrollytelling')) {
      const servicesParent = headerEl.querySelector('[data-nav-target="services"]');
      if (servicesParent) {
        servicesParent.classList.add('text-amber-300', 'font-bold');
      }
    }

    // If on an industry subpage, mark Industries parent trigger
    if (pageName.includes('fmcg') || pageName.includes('tech-saas') || pageName.includes('real-estate') || pageName.includes('d2c')) {
      const industriesParent = headerEl.querySelector('[data-nav-target="industries"]');
      if (industriesParent) {
        industriesParent.classList.add('text-amber-300', 'font-bold');
      }
    }
  }

  /**
   * Bind Mobile Drawer Navigation and Menu Controls
   */
  function bindHeaderEvents(headerEl) {
    const menuBtn = headerEl.querySelector('#mobile-menu-btn');
    const mobileMenu = headerEl.querySelector('#mobile-menu');
    const openIcon = headerEl.querySelector('.menu-open-icon');
    const closeIcon = headerEl.querySelector('.menu-close-icon');

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !mobileMenu.classList.contains('hidden');
        if (isOpen) {
          mobileMenu.classList.add('hidden');
          if (openIcon) openIcon.classList.remove('hidden');
          if (closeIcon) closeIcon.classList.add('hidden');
        } else {
          mobileMenu.classList.remove('hidden');
          if (openIcon) openIcon.classList.add('hidden');
          if (closeIcon) closeIcon.classList.remove('hidden');
        }
      });

      // Close menu on mobile nav link click
      const mobileLinks = mobileMenu.querySelectorAll('a');
      mobileLinks.forEach((link) => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
          if (openIcon) openIcon.classList.remove('hidden');
          if (closeIcon) closeIcon.classList.add('hidden');
        });
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          if (openIcon) openIcon.classList.remove('hidden');
          if (closeIcon) closeIcon.classList.add('hidden');
        }
      });
    }
  }

  /**
   * Bind Footer Events & Global Case Study Modal triggers
   */
  function bindFooterEvents(footerEl) {
    const caseStudyBtns = footerEl.querySelectorAll('.open-case-study-btn');
    caseStudyBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const caseId = btn.getAttribute('data-id');
        
        // If case study modal opener function exists on the current page (e.g. index.html)
        if (typeof window.openCaseStudyModal === 'function') {
          window.openCaseStudyModal(caseId);
        } else {
          // If on a subpage without the modal, redirect smoothly to home portfolio section
          const targetUrl = (isPagesSubdir ? '../index.html' : 'index.html') + '#portfolio';
          window.location.href = targetUrl;
        }
      });
    });
  }

  /**
   * Inject Floating Concierge & WhatsApp Badge
   */
  function injectFloatingConcierge() {
    if (document.getElementById('floating-concierge')) return;

    const concierge = document.createElement('aside');
    concierge.id = 'floating-concierge';
    concierge.className = 'fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5';
    concierge.setAttribute('aria-label', 'Direct Concierge & Studio Support');

    const calcHref = isPagesSubdir ? 'brand-project-calculator.html' : 'pages/brand-project-calculator.html';

    concierge.innerHTML = `
      <div class="flex items-center gap-2">
        <a href="${calcHref}" class="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-amber-400/40 bg-[#0e0e16]/95 text-amber-200 text-xs font-mono font-semibold tracking-wide backdrop-blur-xl shadow-2xl hover:border-amber-400 hover:text-white transition-all transform hover:-translate-y-0.5">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>Brief Concierge</span>
        </a>
        <a href="https://wa.me/919000139572?text=Hello%20Disside%20Studio%2C%20I%20would%20like%20to%20discuss%20a%20branding%20project." target="_blank" rel="noopener noreferrer" class="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-110 flex items-center justify-center focus:outline-none" aria-label="Direct WhatsApp Consultation">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </a>
      </div>
    `;
    document.body.appendChild(concierge);
  }

  /**
   * Load Partial Component from file
   */
  async function loadComponent(targetSelector, componentUrl, postProcessCallback) {
    const container = document.querySelector(targetSelector);
    if (!container) return;

    try {
      const response = await fetch(componentUrl);
      if (!response.ok) {
        console.warn(`[Disside] Failed to fetch ${componentUrl} (Status: ${response.status})`);
        return;
      }
      const rawHtml = await response.text();
      const processedHtml = normalizeHtmlPaths(rawHtml);
      container.innerHTML = processedHtml;

      if (typeof postProcessCallback === 'function') {
        postProcessCallback(container);
      }

      // Refresh Lucide icons if loaded
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: container });
      }
    } catch (err) {
      console.error(`[Disside] Error loading ${componentUrl}:`, err);
    }
  }

  /**
   * Initialize on DOM Ready
   */
  async function init() {
    // Load Header
    await loadComponent('#site-header', headerUrl, (headerEl) => {
      highlightActiveNavigation(headerEl);
      bindHeaderEvents(headerEl);
    });

    // Load Footer
    await loadComponent('#site-footer', footerUrl, (footerEl) => {
      bindFooterEvents(footerEl);
    });

    // Add floating concierge
    injectFloatingConcierge();

    // Final Lucide refresh
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
