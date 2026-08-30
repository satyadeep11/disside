/**
 * DISSIDE BRANDING AGENCY (HYDERABAD & INDIA)
 * Core Application Engine & Scrollytelling Controller
 * Clean White UI & Pure Visual Interactions (Zero Sound)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global HTML Escape Utility (Module Scope)
  const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Safe Toast Notification (Uses textContent to prevent DOM-XSS)
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    const span = document.createElement('span');
    span.textContent = message;
    toast.appendChild(span);
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // ===================================================
  // 1. HERO TYPEWRITER KINETIC EFFECT
  // ===================================================
  const typewriterElement = document.getElementById('typewriter-text');
  const capabilities = [
    'Brand Strategy & Positioning',
    'Visual Identity Systems',
    'Packaging & Unboxing Architecture',
    'Digital Scrollytelling Websites',
    'Corporate Rebranding & Scale',
    'Spatial & Retail Branding'
  ];

  let capIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  const typeEffect = () => {
    if (!typewriterElement) return;
    const currentWord = capabilities[capIndex];

    if (isDeleting) {
      typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35;
    } else {
      typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 2200; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      capIndex = (capIndex + 1) % capabilities.length;
      typingSpeed = 400; // Pause before typing next word
    }

    setTimeout(typeEffect, typingSpeed);
  };
  typeEffect();

  // ===================================================
  // 2. STAT COUNTER ANIMATION (RAF INTERPOLATION)
  // ===================================================
  const counterElements = document.querySelectorAll('.counter');
  let countersAnimated = false;

  const animateCounter = (el, target, duration = 1800) => {
    const start = performance.now();
    const isPercent = el.textContent.includes('%');
    const isCurrency = el.textContent.includes('₹');
    const isPlus = el.textContent.includes('+');

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const current = target * progress;
      let formatted = Math.floor(current).toString();
      if (isCurrency) formatted = `₹${formatted}Cr`;
      if (isPercent) formatted = `${progress === 1 ? '98.4' : Math.floor(current)}%`;
      if (isPlus && !isCurrency && !isPercent) formatted = `${Math.floor(current)}+`;

      el.textContent = formatted;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  const animateCounters = () => {
    if (countersAnimated) return;
    countersAnimated = true;
    counterElements.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (Number.isFinite(target)) {
        animateCounter(el, target);
      }
    });
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.stat-card').forEach(card => counterObserver.observe(card));

  // ===================================================
  // 3. SCROLLYTELLING STAGE & DUAL-TRACK CONTROLLER
  // ===================================================
  const stageData = [
    {
      step: 0,
      phase: 'PHASE 01 : THE IDENTITY PARADOX',
      icon: 'eye-off',
      title: 'The Commodity Trap',
      desc: 'Template logos and fragmented touchpoints bleed customer trust and kill pricing power.',
      metricText: '12% (Critical)',
      metricPercent: '12%',
      colorClass: 'bg-rose-400',
      textColorClass: 'text-rose-300',
      iconWrapColor: 'border-rose-400/40 bg-rose-400/10 text-rose-300'
    },
    {
      step: 1,
      phase: 'PHASE 02 : STRATEGIC CLARITY',
      icon: 'target',
      title: 'Unassailable Territory',
      desc: 'Deep consumer psychology and market gap audit define the high ground your brand will own.',
      metricText: '48% (Positioned)',
      metricPercent: '48%',
      colorClass: 'bg-amber-400',
      textColorClass: 'text-amber-300',
      iconWrapColor: 'border-amber-400/40 bg-amber-400/10 text-amber-300'
    },
    {
      step: 2,
      phase: 'PHASE 03 : MONUMENTAL DESIGN',
      icon: 'layers',
      title: 'Packaging & Spatial Systems',
      desc: 'Crafting unboxing rituals, high-recall visual identities, and interactive digital scrollytelling.',
      metricText: '84% (Distinctive)',
      metricPercent: '84%',
      colorClass: 'bg-yellow-400',
      textColorClass: 'text-yellow-300',
      iconWrapColor: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300'
    },
    {
      step: 3,
      phase: 'PHASE 04 : COMMERCIAL DOMINANCE',
      icon: 'trending-up',
      title: 'Enterprise Valuation Engine',
      desc: 'Compounding brand equity attracts elite capital, lowers CAC, and unlocks 4.8x enterprise multiples.',
      metricText: '96% (Market Leader)',
      metricPercent: '96%',
      colorClass: 'bg-emerald-400',
      textColorClass: 'text-emerald-300',
      iconWrapColor: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
    }
  ];

  const phaseIndicator = document.getElementById('scrolly-phase-indicator');
  const stageTitle = document.getElementById('stage-title');
  const stageDesc = document.getElementById('stage-desc');
  const stageMetricVal = document.getElementById('stage-metric-val');
  const stageMetricBar = document.getElementById('stage-metric-bar');
  const stageIconWrap = document.getElementById('stage-icon-wrap');
  const stageBtns = document.querySelectorAll('.stage-btn');
  const scrollyCards = document.querySelectorAll('.scrolly-step-card');

  const updateScrollyStage = (stepIndex) => {
    const data = stageData[stepIndex] || stageData[0];
    if (phaseIndicator) phaseIndicator.textContent = data.phase;
    if (stageTitle) stageTitle.textContent = data.title;
    if (stageDesc) stageDesc.textContent = data.desc;

    if (stageMetricVal) {
      stageMetricVal.textContent = data.metricText;
      stageMetricVal.className = `${data.textColorClass} font-bold font-mono`;
    }

    if (stageMetricBar) {
      stageMetricBar.style.width = data.metricPercent;
      stageMetricBar.className = `h-full ${data.colorClass} transition-all duration-700`;
    }

    if (stageIconWrap) {
      stageIconWrap.className = `w-14 h-14 rounded-2xl border flex items-center justify-center mb-3 transition-all duration-300 ${data.iconWrapColor}`;
      stageIconWrap.innerHTML = `<i data-lucide="${data.icon}" class="w-7 h-7"></i>`;
      if (window.lucide && stageIconWrap) {
        window.lucide.createIcons({ root: stageIconWrap });
      }
    }

    stageBtns.forEach((btn, idx) => {
      if (idx === stepIndex) {
        btn.classList.add('active', 'border-amber-400/40', 'bg-amber-400/15', 'text-amber-200');
        btn.classList.remove('border-white/10', 'bg-white/5', 'text-stone-400');
      } else {
        btn.classList.remove('active', 'border-amber-400/40', 'bg-amber-400/15', 'text-amber-200');
        btn.classList.add('border-white/10', 'bg-white/5', 'text-stone-400');
      }
    });

    scrollyCards.forEach((card, idx) => {
      if (idx === stepIndex) {
        card.classList.add('active-step');
      } else {
        card.classList.remove('active-step');
      }
    });
  };

  stageBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      updateScrollyStage(step);
      if (scrollyCards[step]) {
        scrollyCards[step].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  const scrollyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const step = parseInt(entry.target.getAttribute('data-step'), 10);
        updateScrollyStage(step);
      }
    });
  }, {
    rootMargin: '-20% 0px -20% 0px',
    threshold: 0.55
  });

  scrollyCards.forEach((card) => {
    scrollyObserver.observe(card);
  });

  // ===================================================
  // 4. PORTFOLIO FILTER CONTROLLER
  // ===================================================
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active', 'border-amber-400', 'bg-amber-400', 'text-slate-950', 'shadow-md');
        b.classList.add('border-white/10', 'bg-white/5', 'text-stone-300');
      });

      btn.classList.add('active', 'border-amber-400', 'bg-amber-400', 'text-slate-950', 'shadow-md');
      btn.classList.remove('border-white/10', 'bg-white/5', 'text-stone-300');

      const filter = btn.getAttribute('data-filter');

      portfolioCards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ===================================================
  // 5. CASE STUDY DATABASE (16 VERIFIED CLIENT SHOWCASES)
  // ===================================================
  const caseStudiesDatabase = {
    'uber': {
      client: 'UBER HYDERABAD',
      category: 'Mobility & Citywide OOH Network',
      year: '2025',
      title: 'Citywide Launch Campaign & Ambient OOH Spatial Network',
      lead: 'Disside engineered a high-impact localized branding system for Uber in Hyderabad, executing citywide hoardings, restaurant tent cards, and cinema promotional collateral.',
      gallery: [
        'assets/images/uber/uber-branding-hyderabad-city-hoarding-2560x1440.jpg',
        'assets/images/uber/uber-branding-hyderabad-city-tent-card-1-2560x1440.jpg',
        'assets/images/uber/uber-branding-hyderabad-city-paper-ad-2560x1440.jpg',
        'assets/images/uber/uber-branding-hyderabad-city-movie-promation-2560x1440.jpg',
        'assets/images/uber/uber-hyderabad-disside-design-studio-2-2560x1440.jpg',
        'assets/images/uber/uber-branding-hyderabad-city-6-2560x1440.jpg',
        'assets/images/uber/Uber-hyderabad-branding-2560x1440.jpg'
      ],
      hasVideo: false,
      challenge: 'Localizing a Silicon Valley mobility giant in the tech capital of South India while preserving global brand standards.',
      solution: 'Created an ambient outdoor branding network across HITEC City, Jubilee Hills, and Secunderabad with localized lifestyle messaging.',
      timeline: '8 Weeks',
      scope: 'OOH Network & Strategy',
      metric1: 'Citywide Market Saturation',
      metric2: '+320% App Installs',
      quote: 'Disside brought hyper-local nuance and design excellence that elevated our city launch beyond expectations.',
      author: '— Marketing Lead, Uber South Asia'
    },
    'bambino': {
      client: 'BAMBINO AGRO',
      category: 'National FMCG & Packaged Foods',
      year: '2024',
      title: 'National FMCG Packaging Architecture & Brand Reboot',
      lead: 'Master rebranding and multi-category retail packaging design for India\'s household vermicelli and pasta giant across 100,000+ retail distribution touchpoints.',
      gallery: [
        'assets/images/bambino/Bambino.jpg',
        'assets/images/bambino/Bambino-2-2560x1440.jpg',
        'assets/images/bambino/bambino-2560x1440.jpg',
        'assets/images/bambino/bambino-agro-website-development-2560x1440.jpg',
        'assets/images/bambino/Bambino-2560x1440-1.jpg'
      ],
      hasVideo: false,
      challenge: 'Modernizing a 40-year legacy FMCG brand without alienating millions of loyal Indian homemakers.',
      solution: 'Architected appetite-appeal packaging hierarchies with vibrant color-coding across pasta, macaroni, and vermicelli SKUs.',
      timeline: '12 Weeks',
      scope: 'Packaging Architecture & Web',
      metric1: '+38% Shelf Off-Take',
      metric2: '4.2M Weekly Impressions',
      quote: 'The refreshed packaging gave Bambino an unmistakable modern edge on modern retail supermarket shelves.',
      author: '— Director of Marketing, Bambino Agro'
    },
    'cream-stone': {
      client: 'CREAM STONE',
      category: 'F&B Confectionery & Sensory Retail',
      year: '2024',
      title: 'Artisanal Ice Creamery Packaging & Parlor Design',
      lead: 'Sensory packaging architecture, custom ice cream tub design, and parlor spatial environmental graphics across 85+ outlets across India.',
      gallery: [
        'assets/images/cream-stone/Cream-Stone-2560x1440.jpg',
        'assets/images/cream-stone/creamstone.jpg',
        'assets/images/cream-stone/creamstone1.jpg',
        'assets/images/cream-stone/Creamstone2-1-2560x1440.jpg',
        'assets/images/cream-stone/creamstone1-2560x1440-1.jpg'
      ],
      hasVideo: false,
      challenge: 'Elevating the in-store cold-stone mixing spectacle into an impulse D2C takeout and retail shelf experience.',
      solution: 'Developed custom embossed tub packaging, gold-foil lid seals, and vibrant neon parlor spatial environmental signage.',
      timeline: '8 Weeks',
      scope: 'Tub Packaging & Spatial Retail',
      metric1: '+44% Takeaway Orders',
      metric2: '85+ National Outlets',
      quote: 'Disside turned our dessert packaging into a social media unboxing sensation that drove record festive sales.',
      author: '— Co-Founder & CEO, Cream Stone'
    },
    'karma-kettle': {
      client: 'KARMA KETTLE',
      category: 'Luxury FMCG & Tea Packaging',
      year: '2024',
      title: 'Artisanal Botanical Tea Master Brand Architecture',
      lead: 'Bespoke tin packaging design, artisanal tea typography, and luxury e-commerce storytelling for India\'s pioneer artisanal blender.',
      gallery: [
        'assets/images/karma-kettle/Karma-Kettle.jpg',
        'assets/images/karma-kettle/Karma-Kettle1.jpg',
        'assets/images/karma-kettle/Karma-Kettle2.jpg',
        'assets/images/karma-kettle/Karma.jpg'
      ],
      hasVideo: false,
      challenge: 'Differentiating artisanal whole-leaf blends from mass-market commercial tea brands on crowded luxury grocery shelves.',
      solution: 'Created vintage botanical illustrated tin canisters with custom debossed gold-foil finishes and sensory tasting narrative notes.',
      timeline: '6 Weeks',
      scope: 'Tin Packaging & E-Commerce',
      metric1: '5-Star Hotel Placement',
      metric2: '+78% Luxury Gifting Sales',
      quote: 'Our tins are celebrated as collector items in luxury hotels and gourmet homes across India and abroad.',
      author: '— Master Blender & Founder, Karma Kettle'
    },
    'fhd-group': {
      client: 'FHD GROUP ARCHITECTS',
      category: 'Architecture Practice & Spatial Monograph',
      year: '2024',
      title: 'Architectural Practice Identity & Scrollytelling Monograph',
      lead: 'Spatial identity, editorial architectural monograph design, and digital scrollytelling web experience for India’s premier green design firm.',
      gallery: [
        'assets/images/fhd-group/fhdgroup-website-hyderabad-india-2560x1440.jpg',
        'assets/images/fhd-group/FHD.jpg',
        'assets/images/fhd-group/fhd4.jpg'
      ],
      hasVideo: false,
      challenge: 'Communicating complex architectural philosophies, urban scale projects, and biophilic designs in an accessible digital monograph.',
      solution: 'Crafted a grid-governed Swiss design system, tactile architectural monograph books, and an award-winning interactive portfolio.',
      timeline: '10 Weeks',
      scope: 'Spatial Identity & Web Monograph',
      metric1: 'WAF Design Recognition',
      metric2: '+110% High-Net-Worth Inquiries',
      quote: 'Disside created a visual language that matches the spatial elegance and environmental rigor of our architectural buildings.',
      author: '— Managing Principal, FHD Group'
    },
    'organo': {
      client: 'ORGANO ECO-HABITATS',
      category: 'Eco-Habitats & Sustainable Living',
      year: '2024',
      title: 'Rurban Eco-Habitat Identity & Sustainable Storytelling',
      lead: 'Establishing Hyderabad’s pioneering collective farming and sustainable living community with organic typography and earth-rooted visual narratives.',
      gallery: [
        'assets/images/organo/Organo.jpg',
        'assets/images/organo/Organo-2560x1440.jpg'
      ],
      hasVideo: false,
      challenge: 'Articulating a radically new living philosophy ("Rurban Eco-Habitats") to urban families accustomed to standard high-rise developments.',
      solution: 'Developed a comprehensive sustainability monograph, spatial wayfinding signage, and tactile editorial print collateral.',
      timeline: '6 Weeks',
      scope: 'Brand Strategy & Monograph',
      metric1: '100% Units Sold',
      metric2: 'Global Eco-Living Award',
      quote: 'Disside articulated our philosophy of living in harmony with nature in a way that deeply resonated with visionary homebuyers.',
      author: '— Founder & Chief Architect, Organo'
    },
    'eclaire': {
      client: 'ECLAIRE PATISSERIE',
      category: 'Artisanal Patisserie & Gifting',
      year: '2023',
      title: 'Parisian Patisserie Visual Identity & Macaron Gifting',
      lead: 'Bespoke pastel packaging suites, ribbon-tied macaron luxury gift boxes, and artisanal café collateral for an authentic French bakery house.',
      gallery: [
        'assets/images/eclaire/Eclaire.jpg',
        'assets/images/eclaire/Eclaire1-4.jpg',
        'assets/images/eclaire/Eclaire11.jpg',
        'assets/images/eclaire/Eclaire14.jpg'
      ],
      hasVideo: false,
      challenge: 'Establishing authentic Parisian elegance in an Indian luxury gifting market crowded with commercial chocolate hampers.',
      solution: 'Designed velvet-touch rigid boxes with gold foil-stamped French serif letterforms, pastel custom tissue wraps, and menus.',
      timeline: '6 Weeks',
      scope: 'Gift Packaging & Visual Identity',
      metric1: '+92% Wedding Gifting Inquiries',
      metric2: 'Top Dessert Destination',
      quote: 'Our packaging has become as famous as our macarons. Disside defined luxury pastry gifting in Hyderabad.',
      author: '— Chef Patron, Eclaire Patisserie'
    },
    'knot': {
      client: 'KNOT STUDIO',
      category: 'D2C Lifestyle & Accessories',
      year: '2024',
      title: 'Minimalist Accessories Identity & E-Commerce Web',
      lead: 'High-concept brand identity, sustainable cardboard unboxing mailers, and conversion-engineered Shopify storefront for modern lifestyle goods.',
      gallery: [
        'assets/images/knot/Knot-disside-branding.jpg',
        'assets/images/knot/Knot-disside-1.jpg',
        'assets/images/knot/Knot-disside-webdesign.jpg',
        'assets/images/knot/Knot-studio.jpg',
        'assets/images/knot/Knot-disside-branding-2560x1440-1.jpg'
      ],
      hasVideo: false,
      challenge: 'Creating a distinct Scandinavian-Japanese minimalist identity for modern design lovers.',
      solution: 'Built a monochrome geometric visual system, plastic-free die-cut unboxing mailers, and a rapid headless digital store.',
      timeline: '8 Weeks',
      scope: 'Identity, Packaging & E-Commerce',
      metric1: '3.8x ROAS Scale',
      metric2: '48k D2C Community',
      quote: 'The clean aesthetic Disside built helped us break through the noise and scale into global design marketplaces.',
      author: '— Founder, Knot Studio'
    },
    'sensomatic': {
      client: 'SENSOMATIC AUTOMATION',
      category: 'Industrial Tech & Sensors',
      year: '2023',
      title: 'Industrial Automation Brand Architecture & Portals',
      lead: 'Technical precision branding, industrial sensor catalog systems, and global exhibition booth graphics for an engineering manufacturer.',
      gallery: [
        'assets/images/sensomatic/Sensomatic.jpg',
        'assets/images/sensomatic/Sensomatic-2560x1440.jpg',
        'assets/images/sensomatic/sensomatic-brand-centric-website-2560x1440.jpg',
        'assets/images/sensomatic/sensomatic-website-print-design-2560x1440.jpg'
      ],
      hasVideo: false,
      challenge: 'Translating deep engineering sensor technology into an authoritative global enterprise brand that commands trust.',
      solution: 'Created an engineered geometric symbol, clean isometric product schematics, and comprehensive technical guidelines.',
      timeline: '8 Weeks',
      scope: 'Enterprise Tech Identity',
      metric1: 'Global Hannover Messe Debut',
      metric2: '+65% Partner Inquiries',
      quote: 'Our new brand identity helped us secure major manufacturing distribution partnerships across Europe and Southeast Asia.',
      author: '— VP Technology, Sensomatic Automation'
    },
    'amogham': {
      client: 'AMOGHAM DINING',
      category: 'Heritage Lakeside Dining',
      year: '2023',
      title: 'Lakeside Heritage Culinary Identity & Spatial Ambiance',
      lead: 'Curating an evocative cultural dining identity overlooking the iconic Hussain Sagar Lake in Hyderabad with handcrafted menus.',
      gallery: [
        'assets/images/amogham/Amogham.jpg',
        'assets/images/amogham/Amogham-2560x1440.jpg'
      ],
      hasVideo: false,
      challenge: 'Standing out among countless casual dining venues while celebrating Hyderabad’s royal culinary traditions.',
      solution: 'Created an opulent royal teal and gold visual system, textured leather menu binders, and illuminated lake-facing outdoor signage.',
      timeline: '5 Weeks',
      scope: 'Visual Identity & Menus',
      metric1: '+42% Weekend Bookings',
      metric2: 'Landmark Status',
      quote: 'Disside captured the royal heritage of Hyderabad in every visual element. Our guest reception has been phenomenal.',
      author: '— General Manager, Amogham Lakeview Dining'
    },
    'brew-nation': {
      client: 'BREW NATION',
      category: 'Craft Brewery & Hospitality',
      year: '2023',
      title: 'Craft Beer Brand Identity & Taproom Spatial Graphics',
      lead: 'Modern industrial microbrewery branding with bold typography, keg packaging, and energetic taproom wall graphics.',
      gallery: [
        'assets/images/brew-nation/brewnation.jpg',
        'assets/images/brew-nation/brewnation-1.jpg'
      ],
      hasVideo: false,
      challenge: 'Creating a youthful, rebellious yet premium microbrewery experience.',
      solution: 'Designed distressed custom letterforms, vibrant can labels, and environmental wall art for the brewpub.',
      timeline: '5 Weeks',
      scope: 'Identity & Spatial',
      metric1: 'Taproom Crowds',
      metric2: 'Award-Winning Cans',
      quote: 'Disside gave Brew Nation an unmistakable energy that drew craft beer lovers across the city.',
      author: '— Head Brewer & Co-Founder, Brew Nation'
    },
    'shian': {
      client: 'SHIAN FASHION',
      category: 'High-Fashion & Apparel Identity',
      year: '2024',
      title: 'Contemporary High-Fashion & Luxury Apparel Identity',
      lead: 'Minimalist luxury branding, high-concept lookbooks, and sophisticated apparel tagging systems for an avant-garde fashion house.',
      gallery: [
        'assets/images/shian/shian1-1.jpg',
        'assets/images/shian/shian2-1.jpg',
        'assets/images/shian/Shian-Capital.jpg'
      ],
      hasVideo: false,
      challenge: 'Carving a distinct luxury identity in a competitive contemporary fashion market requiring timeless elegance.',
      solution: 'Developed an understated monochrome brand identity, tactile embossed hangtags, and sleek editorial lookbooks.',
      timeline: '5 Weeks',
      scope: 'Brand Identity & Collateral',
      metric1: 'Runway Impact',
      metric2: '+48% Buyer Adoption',
      quote: 'Disside created a visual universe that gave our label an immediate high-fashion international appeal.',
      author: '— Creative Director, Shian Fashion'
    },
    'v-krafts': {
      client: 'V-KRAFTS',
      category: 'Bespoke Packaging Craft & Editorial',
      year: '2023',
      title: 'Bespoke Paper Craftsmanship & Luxury Packaging Editorial',
      lead: 'Tactile luxury packaging design monographs, embossed finishes, and brand identity celebrating master paper engineering.',
      gallery: [
        'assets/images/v-krafts/v-krafts-brochure.jpg',
        'assets/images/v-krafts/v-krafts-brochure-1.jpg',
        'assets/images/v-krafts/V-Krafts.jpg'
      ],
      hasVideo: false,
      challenge: 'Presenting intricate industrial paper craft techniques as high-luxury architectural packaging to elite brands.',
      solution: 'Crafted an editorial showcase monograph with specialty foil finishes, textured paper stocks, and die-cut sample cases.',
      timeline: '6 Weeks',
      scope: 'Editorial Monograph & Identity',
      metric1: 'Bespoke Benchmark',
      metric2: '+60% Enterprise Contracts',
      quote: 'The craftsmanship and attention to detail in our new brand collateral reflects our passion for luxury packaging perfectly.',
      author: '— Founder, V-Krafts'
    },
    'over-the-wicket': {
      client: 'OVER THE WICKET FILMS',
      category: 'Film Production & Motion Visuals',
      year: '2024',
      title: 'Film Production House Identity & Motion Visuals',
      lead: 'Dynamic cinematic title sequences, corporate production branding, and visual identity for a premier Indian film and advertising house.',
      gallery: [
        'assets/images/over-the-wicket/over-the-Wicket-Films.jpg',
        'assets/images/over-the-wicket/over-the-wicket-films1.jpg'
      ],
      hasVideo: false,
      challenge: 'Communicating high-production cinematic capability and creative storytelling excellence to major OTT and theatrical producers.',
      solution: 'Architected a bold motion-first identity system, cinematic bumper animations, and modern pitch deck templates.',
      timeline: '4 Weeks',
      scope: 'Motion Identity & Pitch Systems',
      metric1: 'Theatrical Release',
      metric2: 'Top-Tier OTT Deals',
      quote: 'Disside gave our production banner an unforgettable cinematic identity that commands respect in every pitch meeting.',
      author: '— Executive Producer, Over The Wicket Films'
    },
    'goldstone': {
      client: 'GOLDSTONE',
      category: 'Electric Mobility & Infrastructure',
      year: '2024',
      title: 'Electric Mobility & National EV Infrastructure Systems',
      lead: 'Clean technology brand architecture, electric bus fleet livery, and digital portal design for India\'s clean mobility pioneers.',
      gallery: [
        'assets/images/goldstone/Goldstone.jpg',
        'assets/images/goldstone/Goldstone-2560x1440.jpg',
        'assets/images/goldstone/goldstone-electric-bus-website-devlopement-2560x1440.jpg'
      ],
      hasVideo: false,
      challenge: 'Positioning a legacy enterprise as a cutting-edge pioneer in national green electric transport infrastructure.',
      solution: 'Developed an aerodynamic clean energy design language, fleet vehicle livery, and digital enterprise portal.',
      timeline: '6 Weeks',
      scope: 'EV Brand Architecture & Livery',
      metric1: 'National EV Network',
      metric2: '+85% Institutional Trust',
      quote: 'Disside successfully transformed our brand perception into a forward-looking technological force in green mobility.',
      author: '— Head of Corporate Strategy, Goldstone'
    },
    'supervek': {
      client: 'SUPERVEK',
      category: 'D2C Streetwear & Global Collabs',
      year: '2024',
      title: 'Cult Streetwear & "Keep Pushing" Video Reel',
      lead: 'Positioning India’s premier Tyvek accessories brand for youth culture dominance with video art direction, Jägermeister collaboration, and packaging.',
      gallery: [
        'assets/images/supervek/Jager_500x.webp'
      ],
      hasVideo: true,
      videoSrc: 'assets/images/supervek/KeepPushing-Supervek-x-Jagermeister.mp4',
      challenge: 'Creating a viral streetwear video campaign for Tyvek products.',
      solution: 'Directed high-energy video spots and collaboration packaging.',
      timeline: '6 Weeks',
      scope: 'Video Reel & Campaign',
      metric1: '5.2x D2C Scale',
      metric2: '74% Unboxing Share',
      quote: 'Disside understands the pulse of modern youth culture better than anyone.',
      author: '— Co-Founder, Supervek'
    }
  };

  const caseStudyModal = document.getElementById('case-study-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const openCaseStudyBtns = document.querySelectorAll('.open-case-study-btn');
  const openHeroReelBtn = document.getElementById('open-hero-reel-btn');

  // Modal Fields
  const modalClientBadge = document.getElementById('modal-client-badge');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalLead = document.getElementById('modal-lead');
  const modalChallenge = document.getElementById('modal-challenge');
  const modalSolution = document.getElementById('modal-solution');
  const modalTimeline = document.getElementById('modal-timeline');
  const modalScope = document.getElementById('modal-scope');
  const modalMetric1 = document.getElementById('modal-metric-1');
  const modalMetric2 = document.getElementById('modal-metric-2');
  const modalQuote = document.getElementById('modal-quote');
  const modalAuthor = document.getElementById('modal-author');

  // Modal Media Showcase
  const modalVideoWrap = document.getElementById('modal-video-wrap');
  const modalVideoPlayer = document.getElementById('modal-video-player');
  const modalGalleryTrack = document.getElementById('modal-gallery-track');
  const modalGalleryDots = document.getElementById('modal-gallery-dots');
  const galleryCountBadge = document.getElementById('gallery-count-badge');
  const galleryPrevBtn = document.getElementById('gallery-prev-btn');
  const galleryNextBtn = document.getElementById('gallery-next-btn');

  // Horizontal Multi-Image Project Gallery Renderer (Safe DOM Construction)
  const renderHorizontalGallery = (images) => {
    if (!modalGalleryTrack) return;
    modalGalleryTrack.innerHTML = '';
    if (modalGalleryDots) modalGalleryDots.innerHTML = '';

    if (!images || images.length === 0) {
      if (galleryCountBadge) galleryCountBadge.textContent = '0 Images';
      return;
    }

    if (galleryCountBadge) {
      galleryCountBadge.textContent = `${images.length} Image${images.length > 1 ? 's' : ''}`;
    }

    images.forEach((imgSrc, index) => {
      // Build Slide Card via real DOM APIs (Zero innerHTML string injection risk)
      const card = document.createElement('div');
      card.className = 'gallery-slide-card flex-shrink-0 relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-md';

      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = `Project Showcase Asset ${index + 1}`;
      img.loading = 'lazy';
      img.className = 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105';

      const gradientOverlay = document.createElement('div');
      gradientOverlay.className = 'absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none';

      const badge = document.createElement('div');
      badge.className = 'absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-white/85 backdrop-blur-sm text-[10px] font-mono font-bold text-slate-800 shadow-sm';
      badge.textContent = `Asset ${String(index + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;

      card.appendChild(img);
      card.appendChild(gradientOverlay);
      card.appendChild(badge);
      modalGalleryTrack.appendChild(card);

      // Build Indicator Dot
      if (modalGalleryDots) {
        const dot = document.createElement('button');
        dot.className = `gallery-dot h-2 rounded-full transition-all duration-300 ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Navigate to slide ${index + 1}`);
        dot.addEventListener('click', () => {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        modalGalleryDots.appendChild(dot);
      }
    });
  };

  // Gallery Navigation Buttons
  if (galleryPrevBtn && modalGalleryTrack) {
    galleryPrevBtn.addEventListener('click', () => {
      modalGalleryTrack.scrollBy({ left: -340, behavior: 'smooth' });
    });
  }

  if (galleryNextBtn && modalGalleryTrack) {
    galleryNextBtn.addEventListener('click', () => {
      modalGalleryTrack.scrollBy({ left: 340, behavior: 'smooth' });
    });
  }

  // Gallery Scroll Sync with requestAnimationFrame Coalescing (Prevents layout thrashing)
  if (modalGalleryTrack && modalGalleryDots) {
    let galleryScrollRaf = null;
    modalGalleryTrack.addEventListener('scroll', () => {
      if (galleryScrollRaf) return;
      galleryScrollRaf = requestAnimationFrame(() => {
        galleryScrollRaf = null;
        const cards = modalGalleryTrack.querySelectorAll('.gallery-slide-card');
        const trackLeft = modalGalleryTrack.getBoundingClientRect().left;
        let closestIdx = 0;
        let minDistance = Infinity;

        cards.forEach((c, idx) => {
          const rect = c.getBoundingClientRect();
          const distance = Math.abs(rect.left - trackLeft);
          if (distance < minDistance) {
            minDistance = distance;
            closestIdx = idx;
          }
        });

        const dots = modalGalleryDots.querySelectorAll('.gallery-dot');
        dots.forEach((d, idx) => {
          if (idx === closestIdx) {
            d.classList.add('active');
          } else {
            d.classList.remove('active');
          }
        });
      });
    }, { passive: true });
  }

  // In-Memory Gallery Cache (Zero repeated network requests)
  const galleryCache = {};

  const openCaseStudy = async (caseId) => {
    const data = caseStudiesDatabase[caseId];
    if (!data || !caseStudyModal) return;

    if (modalClientBadge) modalClientBadge.textContent = data.client;
    if (modalCategory) modalCategory.textContent = data.category;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalLead) modalLead.textContent = data.lead;
    if (modalChallenge) modalChallenge.textContent = data.challenge;
    if (modalSolution) modalSolution.textContent = data.solution;
    if (modalTimeline) modalTimeline.textContent = data.timeline;
    if (modalScope) modalScope.textContent = data.scope;
    if (modalMetric1) modalMetric1.textContent = data.metric1;
    if (modalMetric2) modalMetric2.textContent = data.metric2;
    if (modalQuote) modalQuote.textContent = `"${data.quote}"`;
    if (modalAuthor) modalAuthor.textContent = data.author;

    // Handle video
    if (data.hasVideo && modalVideoWrap && modalVideoPlayer) {
      modalVideoWrap.classList.remove('hidden');
      modalVideoPlayer.src = data.videoSrc || 'assets/images/supervek/KeepPushing-Supervek-x-Jagermeister.mp4';
    } else {
      if (modalVideoWrap) modalVideoWrap.classList.add('hidden');
      if (modalVideoPlayer) {
        modalVideoPlayer.pause();
        modalVideoPlayer.removeAttribute('src');
        modalVideoPlayer.load();
      }
    }

    // 1. Instant Optimistic Render: Use cache if available, or static database array (0ms UI latency)
    const initialImages = galleryCache[caseId] || data.gallery || [];
    renderHorizontalGallery(initialImages);

    caseStudyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (window.lucide) window.lucide.createIcons();

    // 2. Background Auto-Discovery: If not cached yet, fetch live folder contents asynchronously
    if (!galleryCache[caseId]) {
      try {
        const res = await fetch(`assets/php/get-gallery.php?client=${encodeURIComponent(caseId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.images) && json.images.length > 0) {
            const imageList = json.images.filter(img => !img.endsWith('.mp4'));
            if (imageList.length > 0) {
              galleryCache[caseId] = imageList;
              renderHorizontalGallery(imageList);
            }
          }
        }
      } catch (err) {
        // Fall back seamlessly to local database gallery
      }
    }
  };

  const closeCaseStudy = () => {
    if (!caseStudyModal) return;
    if (modalVideoPlayer) {
      modalVideoPlayer.pause();
      modalVideoPlayer.removeAttribute('src');
      modalVideoPlayer.load();
    }
    caseStudyModal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  // Open case study when clicking buttons or anywhere on a client card
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.open-case-study-btn, .portfolio-card[data-id], .client-card[data-id], [data-case-id], [data-case-card][data-id]');
    if (!trigger) return;

    // If user clicked a direct external link or navigation anchor, allow normal navigation
    const isExternalNav = e.target.closest('a[href]:not([href="#"]):not([href="javascript:void(0)"])');
    if (isExternalNav && !isExternalNav.classList.contains('open-case-study-btn')) {
      return;
    }

    const caseId = trigger.getAttribute('data-id') || trigger.getAttribute('data-case-id');
    if (caseId) {
      e.preventDefault();
      e.stopPropagation();
      openCaseStudy(caseId);
    }
  });

  if (openHeroReelBtn) {
    openHeroReelBtn.addEventListener('click', () => {
      openCaseStudy('supervek');
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeCaseStudy);
  }

  if (caseStudyModal) {
    caseStudyModal.addEventListener('click', (e) => {
      if (e.target === caseStudyModal) closeCaseStudy();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseStudyModal && !caseStudyModal.classList.contains('hidden')) {
      closeCaseStudy();
    }
  });

  // ===================================================
  // 6. INTERACTIVE BRAND BRIEF CALCULATOR WIZARD
  // ===================================================
  const wizardStepContents = document.querySelectorAll('.wizard-step-content');
  const briefSummaryView = document.getElementById('brief-summary-view');
  const wizardProgressPct = document.getElementById('wizard-progress-pct');

  const goToWizardStep = (stepNum) => {
    wizardStepContents.forEach((step, idx) => {
      if (idx + 1 === stepNum) {
        step.classList.remove('hidden');
      } else {
        step.classList.add('hidden');
      }
    });

    // Update pill indicators
    [1, 2, 3, 4].forEach((num) => {
      const pill = document.getElementById(`step-pill-${num}`);
      if (!pill) return;
      if (num === stepNum) {
        pill.className = 'whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition-all';
      } else if (num < stepNum) {
        pill.className = 'whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200 font-semibold transition-all';
      } else {
        pill.className = 'whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-full bg-white/5 text-stone-400 font-semibold border border-white/5 transition-all';
      }
    });

    const progressValues = { 1: '25%', 2: '50%', 3: '75%', 4: '100%' };
    if (wizardProgressPct) wizardProgressPct.textContent = progressValues[stepNum] || '25%';

    if (stepNum === 4 && briefSummaryView) {
      const selectedIndustry = document.querySelector('input[name="brief-industry"]:checked')?.value || 'Technology & SaaS';
      const selectedScopes = Array.from(document.querySelectorAll('input[name="brief-scope"]:checked')).map(cb => cb.value);
      const selectedStage = document.querySelector('input[name="brief-stage"]:checked')?.value || 'Growth / Scale';

      const safeIndustry = escapeHTML(selectedIndustry);
      const safeScopes = escapeHTML(selectedScopes.join(' + ') || 'Full Brand Strategy');
      const safeStage = escapeHTML(selectedStage);

      briefSummaryView.innerHTML = `
        <div class="flex justify-between py-1.5 border-b border-white/10">
          <span class="text-stone-400">Industry:</span>
          <span class="text-amber-200 font-bold">${safeIndustry}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-white/10">
          <span class="text-stone-400">Selected Deliverables:</span>
          <span class="text-amber-300 font-bold text-right">${safeScopes}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-white/10">
          <span class="text-stone-400">Enterprise Stage:</span>
          <span class="text-emerald-400 font-bold">${safeStage}</span>
        </div>
        <div class="flex justify-between py-1.5">
          <span class="text-stone-400">Estimated Roadmap:</span>
          <span class="text-stone-200 font-bold">4 to 6 Weeks Cohort</span>
        </div>
      `;
    }
  };

  document.querySelectorAll('.wizard-next-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.getAttribute('data-next'), 10);
      goToWizardStep(nextStep);
    });
  });

  document.querySelectorAll('.wizard-prev-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.getAttribute('data-prev'), 10);
      goToWizardStep(prevStep);
    });
  });

  // Brief Form Submit (Robust Multi-Tier Dispatch with Honest Error Reporting)
  const submitBriefBtn = document.getElementById('submit-brief-btn');
  if (submitBriefBtn) {
    submitBriefBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('brief-name');
      const emailInput = document.getElementById('brief-email');
      const companyInput = document.getElementById('brief-company');
      const phoneInput = document.getElementById('brief-phone');

      const name = nameInput?.value.trim();
      const email = emailInput?.value.trim();
      const company = companyInput?.value.trim() || 'Not specified';
      const phone = phoneInput?.value.trim() || 'Not provided';

      if (!name || !email) {
        showToast('⚠️ Please enter your name and work email');
        if (!name && nameInput) nameInput.focus();
        else if (emailInput) emailInput.focus();
        return;
      }

      // Robust email validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(email)) {
        showToast('⚠️ Please enter a valid work email address');
        if (emailInput) emailInput.focus();
        return;
      }

      const selectedIndustry = document.querySelector('input[name="brief-industry"]:checked')?.value || 'Technology & SaaS';
      const selectedScopes = Array.from(document.querySelectorAll('input[name="brief-scope"]:checked')).map(cb => cb.value);
      const selectedStage = document.querySelector('input[name="brief-stage"]:checked')?.value || 'Growth / Scale';
      const websiteTrap = document.getElementById('brief-website-trap')?.value || '';

      const briefPayload = {
        name: name,
        email: email,
        company: company,
        phone: phone,
        industry: selectedIndustry,
        scope: selectedScopes.join(', ') || 'Full Brand Strategy',
        stage: selectedStage,
        website_trap: websiteTrap,
        _t: Math.floor(Date.now() / 1000),
        _subject: `🚀 New Brand Brief from ${name} (${company}) — Disside`,
        _template: 'table',
        _captcha: 'false'
      };

      submitBriefBtn.disabled = true;
      submitBriefBtn.innerHTML = `<span>Dispatching to hello@disside.com...</span> <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>`;
      if (window.lucide) window.lucide.createIcons();

      let isSuccess = false;
      let failureReason = '';

      try {
        // Step 1: Attempt dispatch to local hardened PHP endpoint
        let networkFailed = false;
        try {
          const phpRes = await fetch('assets/php/send-brief.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(briefPayload)
          });

          if (phpRes.ok) {
            const phpJson = await phpRes.json();
            if (phpJson.success) {
              isSuccess = true;
            }
          } else if (phpRes.status === 429) {
            // Deliberate rate limit rejection — do NOT route around via FormSubmit
            showToast('⚠️ Rate limit reached. Please wait a few moments before trying again.');
            submitBriefBtn.disabled = false;
            submitBriefBtn.innerHTML = `<span>Submit Strategic Brief</span> <i data-lucide="send" class="w-4 h-4"></i>`;
            if (window.lucide) window.lucide.createIcons();
            return;
          } else if (phpRes.status === 400) {
            showToast('⚠️ Please verify your inputs and try again.');
            submitBriefBtn.disabled = false;
            submitBriefBtn.innerHTML = `<span>Submit Strategic Brief</span> <i data-lucide="send" class="w-4 h-4"></i>`;
            if (window.lucide) window.lucide.createIcons();
            return;
          } else {
            networkFailed = true;
          }
        } catch (err) {
          networkFailed = true;
        }

        // Step 2: Fall back to FormSubmit only on genuine local endpoint network unavailability
        if (!isSuccess && networkFailed) {
          try {
            const cloudRes = await fetch('https://formsubmit.co/ajax/hello@disside.com', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(briefPayload)
            });

            if (cloudRes.ok) {
              const cloudJson = await cloudRes.json();
              if (cloudJson.success === 'true' || cloudJson.success === true) {
                isSuccess = true;
              }
            }
          } catch (cloudErr) {
            failureReason = cloudErr.message;
          }
        }

        if (isSuccess) {
          showToast('🚀 Brief Received! A Senior Partner will contact you within 4 hours.');
          submitBriefBtn.innerHTML = `<span>Brief Sent to hello@disside.com!</span> <i data-lucide="check" class="w-4 h-4"></i>`;
          submitBriefBtn.classList.remove('bg-brand-orange');
          submitBriefBtn.classList.add('bg-emerald-600');
          if (window.lucide) window.lucide.createIcons();
        } else {
          // Honest failure reporting (Zero false success messages)
          showToast('⚠️ Dispatch failed. Please email us directly at hello@disside.com or call +91-9000139572');
          submitBriefBtn.disabled = false;
          submitBriefBtn.innerHTML = `<span>Retry Submission</span> <i data-lucide="refresh-cw" class="w-4 h-4"></i>`;
          if (window.lucide) window.lucide.createIcons();
        }

      } catch (fatalError) {
        showToast('⚠️ Connection error. Please email hello@disside.com');
        submitBriefBtn.disabled = false;
        submitBriefBtn.innerHTML = `<span>Retry Submission</span> <i data-lucide="refresh-cw" class="w-4 h-4"></i>`;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // ===================================================
  // 7. FAQ ACCORDION HANDLERS
  // ===================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close all other items
        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('active');
            const otherContent = other.querySelector('.faq-content');
            const otherTrigger = other.querySelector('.faq-trigger');
            if (otherContent) otherContent.style.maxHeight = null;
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          content.style.maxHeight = null;
          item.classList.remove('active');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // ===================================================
  // 8. MOBILE DRAWER MENU
  // ===================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    const menuOpenIcon = mobileMenuBtn.querySelector('.menu-open-icon');
    const menuCloseIcon = mobileMenuBtn.querySelector('.menu-close-icon');

    mobileMenuBtn.addEventListener('click', () => {
      const isClosed = mobileMenu.classList.contains('hidden');
      if (isClosed) {
        mobileMenu.classList.remove('hidden');
        menuOpenIcon?.classList.add('hidden');
        menuCloseIcon?.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
        menuOpenIcon?.classList.remove('hidden');
        menuCloseIcon?.classList.add('hidden');
      }
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuOpenIcon?.classList.remove('hidden');
        menuCloseIcon?.classList.add('hidden');
      });
    });
  }

});
