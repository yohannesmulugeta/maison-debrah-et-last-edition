import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { categories, categoryName, productCategory, productsInCategory, topCategories, type Product } from './data/catalog'
import { collectionShowroomScenes, homeShowroomScenes, projectGroups } from './data/projectImages'
import siteData from './data/site.json'

const ETHIOPIA_CONTACT = siteData.contact
const HOME_CONTENT = siteData.home

const asset = (src: string) => src.startsWith('/') && !src.startsWith(import.meta.env.BASE_URL) ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src
const reference = (name: string) => asset(`/images/reference-home/${name}`)
const brochureUrl = 'https://online.flippingbook.com/view/1004331464/'
const CART_STORAGE_KEY = `maison-debrah-cart:${import.meta.env.BASE_URL}`

type Cart = Record<string, number>
function loadCart(): Cart {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}')
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {}
    return Object.fromEntries(
      Object.entries(saved)
        .filter(([slug, quantity]) => slug.length > 0 && typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0)
        .map(([slug, quantity]) => [slug, Math.min(99, quantity as number)])
    )
  } catch {
    return {}
  }
}

const menuGroups = [
  {
    label: 'Furniture',
    to: '/collection/meubilair',
    items: [
      ['Sofas & sectionals', 'banken-hoekbanken'],
      ['Armchairs & statement chairs', 'fauteuils-statement-stoelen'],
      ['Dining chairs & stools', 'eetkamerstoelen-barkrukken'],
      ['Dining tables', 'eetkamertafels'],
      ['Coffee tables', 'salontafels'],
      ['Side tables', 'bijzettafels'],
      ['Console tables', 'consoletafels'],
      ['Reception desks', 'balietafels'],
      ['Desks', 'bureaus'],
      ['Chests & bedside tables', 'commodes-nachtkastjes'],
      ['Sideboards', 'dressoires'],
      ['Consoles', 'consoles'],
      ['Bookcases & shelving', 'boekenkasten-planken'],
      ['Beds & headboards', 'bedden-hoofdborden'],
      ['TV cabinets', 'tv-meubels'],
      ['Pedestals', 'pilaren'],
    ].map(([label, slug]) => ({ label, to: `/collection/${slug}` })),
  },
  {
    label: 'Lighting',
    to: '/collection/verlichting',
    items: [
      ['Pendants & chandeliers', 'hanglampen-kroonluchters'],
      ['Ceiling lights', 'plafonnieres'],
      ['Table lamps', 'tafellampen'],
      ['Wall lamps', 'wandlampen'],
      ['Floor lamps', 'staande-lampen'],
    ].map(([label, slug]) => ({ label, to: `/collection/${slug}` })),
  },
  {
    label: 'Decoration',
    to: '/collection/decoratie',
    items: [
      ['Mirrors', 'spiegels'],
      ['Wall decoration', 'wanddecoratie'],
      ['Vases & planters', 'vazen-en-plantenbakken'],
    ].map(([label, slug]) => ({ label, to: `/collection/${slug}` })),
  },
  {
    label: 'Projects',
    to: '/projects',
    items: [
      { label: 'Showroom gallery', to: '/projects' },
      { label: 'Hospitality', to: '/hospitality' },
      { label: 'Home interiors', to: '/home-interiors' },
    ],
  },
  {
    label: 'About us',
    to: '/about',
    items: [{ label: 'Maison Debrah Ethiopia', to: '/about' }],
  },
  {
    label: 'Contact',
    to: '/contact',
    items: [
      { label: 'Customer service', to: '/customer-service' },
      { label: 'Frequently asked questions', to: '/faq' },
    ],
  },
]
const megaMenuImages: Record<string, string> = { Furniture: '3.jpg', Lighting: '2.jpg', Decoration: '5.jpg' }

function DesktopMenu({
  group,
  openMenu,
  setOpenMenu,
}: {
  group: (typeof menuGroups)[number]
  openMenu: string | null
  setOpenMenu: (value: string | null) => void
}) {
  const image = megaMenuImages[group.label]
  return (
    <div
      className={`nav-menu ${image ? 'nav-menu--mega' : 'nav-menu--simple'}`}
      data-open={openMenu === group.label}
      onMouseEnter={() => setOpenMenu(group.label)}
      onMouseLeave={() => setOpenMenu(null)}
      onFocus={() => setOpenMenu(group.label)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpenMenu(null)
      }}
    >
      <div className="nav-menu-trigger">
        <NavLink to={group.to}>{group.label}</NavLink>
        <button
          className="nav-chevron"
          type="button"
          aria-label={`Open ${group.label} menu`}
          aria-expanded={openMenu === group.label}
          onClick={() => setOpenMenu(group.label)}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <div className={`nav-dropdown ${image ? 'nav-dropdown--mega' : 'nav-dropdown--simple'}`}>
        <div className="nav-dropdown-panel">
          <div className="nav-dropdown-links">
            {group.items.map((item) => (
              <Link key={`${group.label}-${item.to}`} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
          {image && <img src={reference(image)} alt="" />}
        </div>
      </div>
    </div>
  )
}

function Icon({ name }: { name: 'search' | 'account' | 'cart' | 'whatsapp' | 'whatsapp-outline' | 'instagram' | 'linkedin' | 'arrow-up' | 'message' }) {
  if (name === 'search') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.8" /><path d="m16 16 5 5" /></svg>
  if (name === 'account') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.3" /><path d="M4.5 21v-2.2a7.5 7.5 0 0 1 15 0V21" /></svg>
  if (name === 'cart') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h2l2.1 12.5h13.1l2-9.5H5" /><circle cx="8" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
  if (name === 'whatsapp') {
    return (
      <svg viewBox="0 0 175.216 175.552" aria-hidden="true">
        <defs>
          <linearGradient id="wa-icon-grad" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#57d163" />
            <stop offset="1" stopColor="#23b33a" />
          </linearGradient>
        </defs>
        <path
          fill="#fff"
          d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
        />
        <path
          fill="url(#wa-icon-grad)"
          d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
        />
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
        />
      </svg>
    )
  }
  if (name === 'whatsapp-outline') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.4 11.6a8.4 8.4 0 0 1-12.4 7.3L3 20l1.2-4.7a8.4 8.4 0 1 1 16.2-3.7Z" />
        <path d="M8.3 7.8c.3-.4.8-.4 1.1 0l1 1.5c.2.3.2.7-.1 1l-.6.6a8.7 8.7 0 0 0 3.4 3.4l.6-.6c.3-.3.7-.3 1-.1l1.5 1c.4.3.4.8 0 1.1-.6.6-1.2.9-2 .7-3.2-.7-5.9-3.4-6.6-6.6-.2-.8.1-1.4.7-2Z" />
      </svg>
    )
  }
  if (name === 'message') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  }
  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    )
  }
  if (name === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function ProductImage({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>()
  if (!src || failedSrc === src) return <div className={`image-fallback ${className}`} role="img" aria-label={`${alt} image unavailable`}>Image unavailable</div>
  return <img className={className} src={asset(src)} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />
}

function Header({ count }: { count: number }) {
  const [open, setOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const menuToggle = useRef<HTMLButtonElement>(null)
  const mobileNav = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'
  const isTransparent = isHome && !isScrolled && !openMenu && !open

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  useEffect(() => {
    if (open) mobileNav.current?.querySelector<HTMLButtonElement>('.mobile-top button')?.focus()
  }, [open])
  const closeMobileMenu = () => {
    setOpen(false)
    menuToggle.current?.focus()
  }
  const handleMobileMenuKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      closeMobileMenu()
      return
    }
    if (event.key !== 'Tab') return
    const items = mobileNav.current?.querySelectorAll<HTMLElement>('a, button, summary')
    if (!items?.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOpenMenu(null)
    const query = String(new FormData(event.currentTarget).get('q') || '').trim()
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop')
  }
  const skipToContent = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const main = document.getElementById('main-content')
    if (!main) return
    main.tabIndex = -1
    main.focus({ preventScroll: true })
    main.scrollIntoView()
  }

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={skipToContent}>Skip to content</a>
      <header className={`site-header ${isHome ? 'site-header--home' : ''} ${isTransparent ? 'site-header--transparent' : 'site-header--solid'}`}>
        <div className="header-top">
          <form className="header-search" role="search" onSubmit={search}>
            <Icon name="search" />
            <input name="q" type="search" placeholder="Search for a piece or collection" aria-label="Search collection" />
            <button type="submit" aria-label="Search collection"><Icon name="search" /></button>
          </form>
          <Link className="brand" to="/" aria-label="Maison Debrah Ethiopia home">
            <img src={reference('MAISON_DEBRAH_LOGO_POS_RGB.svg')} alt="Maison Debrah Ethiopia" width="1300" height="360" />
          </Link>
          <div className="header-actions">
            <Link to="/contact" aria-label="Showroom & Inquiries"><Icon name="account" /></Link>
            <Link to="/cart" aria-label={`Cart, ${count} items`}>
              <Icon name="cart" />
              {count > 0 && <span className="cart-count">{count}</span>}
            </Link>
            <button ref={menuToggle} className="menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
        <nav className="desktop-nav" aria-label="Main navigation" onClick={(event) => { if ((event.target as Element).closest('a')) setOpenMenu(null) }}>
          <NavLink to="/" end>Home</NavLink>
          {menuGroups.slice(0, 5).map((group) => <DesktopMenu group={group} openMenu={openMenu} setOpenMenu={setOpenMenu} key={group.label} />)}
          <a href={brochureUrl} target="_blank" rel="noreferrer">Brochure</a>
          <DesktopMenu group={menuGroups[5]} openMenu={openMenu} setOpenMenu={setOpenMenu} />
        </nav>
        {open && (
          <div className="mobile-shade" onClick={closeMobileMenu}>
            <nav ref={mobileNav} className="mobile-nav" aria-label="Mobile navigation" onKeyDown={handleMobileMenuKeyDown} onClick={(event) => { if ((event.target as Element).closest('a')) setOpen(false); event.stopPropagation() }}>
              <div className="mobile-top">
                <strong>Maison Debrah Ethiopia</strong>
                <button type="button" onClick={closeMobileMenu} aria-label="Close menu">×</button>
              </div>
              <Link to="/">Home</Link>
              {menuGroups.map((group) => (
                <details key={group.label}>
                  <summary>{group.label}</summary>
                  <Link to={group.to}>View all {group.label.toLowerCase()}</Link>
                  {group.items.map((item) => (
                    <Link to={item.to} key={`${group.label}-${item.to}`}>{item.label}</Link>
                  ))}
                </details>
              ))}
              <a href={brochureUrl} target="_blank" rel="noreferrer">Brochure</a>
              <Link to="/contact">Addis Ababa Showroom</Link>
              <Link to="/cart">Inquiry Cart ({count})</Link>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-columns">
        <section>
          <h2>Customer service</h2>
          <Link to="/faq">Frequently asked questions</Link>
          <Link to="/contact">Showroom & Inquiries</Link>
          <Link to="/shipping">Delivery & logistics</Link>
          <Link to="/returns">Custom orders & returns</Link>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms & conditions</Link>
        </section>
        <section>
          <h2>Collection</h2>
          <Link to="/collection/banken-hoekbanken">Sofas & sectionals</Link>
          <Link to="/collection/fauteuils-statement-stoelen">Statement chairs</Link>
          <Link to="/collection/verlichting">Lighting</Link>
          <Link to="/collection/eetkamertafels">Dining tables</Link>
          <Link to="/collection/dressoires">Cabinets & sideboards</Link>
          <Link to="/collection/salontafels">Coffee tables</Link>
          <Link to="/collection/bedden-hoofdborden">Beds</Link>
        </section>
        <section>
          <h2>Direct Inquiries</h2>
          <a href={`https://wa.me/${ETHIOPIA_CONTACT.whatsappRaw}?text=Hello%20Maison%20Debrah%20Ethiopia`} target="_blank" rel="noreferrer">
            WhatsApp: {ETHIOPIA_CONTACT.phone}
          </a>
          <a href={`mailto:${ETHIOPIA_CONTACT.email}`}>Email: {ETHIOPIA_CONTACT.email}</a>
          <Link to="/catalogue-request">Request catalogue</Link>
          <Link to="/design-consult">Design consultation</Link>
        </section>
        <section>
          <h2>Addis Ababa Showroom</h2>
          <p>
            Maison Debrah Ethiopia<br />
            {ETHIOPIA_CONTACT.showroom}
          </p>
          <div className="footer-social">
            <a href="https://www.instagram.com/maisondebrah_nl/" target="_blank" rel="noreferrer" aria-label="Maison Debrah on Instagram" className="social-circle">
              <Icon name="instagram" />
            </a>
            <a href="https://www.linkedin.com/in/maisondebrah/" target="_blank" rel="noreferrer" aria-label="Maison Debrah on LinkedIn" className="social-circle">
              <Icon name="linkedin" />
            </a>
            <a href={`https://wa.me/${ETHIOPIA_CONTACT.whatsappRaw}`} target="_blank" rel="noreferrer" aria-label="Chat with our Addis Ababa showroom on WhatsApp" className="social-circle">
              <Icon name="whatsapp-outline" />
            </a>
          </div>
        </section>
        <section>
          <h2>Opening hours</h2>
          <p>
            {ETHIOPIA_CONTACT.hoursWeekday}<br />
            {ETHIOPIA_CONTACT.hoursSaturday}<br />
            {ETHIOPIA_CONTACT.hoursSunday}
          </p>
        </section>
      </div>
      <div className="footer-bottom">
        <p>© Copyright · 2026 · Maison Debrah Ethiopia · All rights reserved</p>
        <p>Discover the world of Maison Debrah Ethiopia. Luxury designer furniture, architectural lighting, and bespoke interior appointments tailored for exceptional penthouses, residences, and hospitality projects across Addis Ababa and throughout Ethiopia.</p>
      </div>
    </footer>
  )
}

function ProductCard({
  product,
  image,
  promo = false,
  onAddToCart,
}: {
  product: Product
  image?: string
  promo?: boolean
  onAddToCart?: (slug: string, quantity: number) => void
}) {
  const picture = (
    <div className="product-image">
      <ProductImage src={image || product.images[0]?.thumbnail || product.images[0]?.src} alt={product.name} />
    </div>
  )
  if (promo) {
    return (
      <Link className="product-card promo-card" to={`/product/${product.slug}`}>
        {picture}
        <h3>{product.name}</h3>
      </Link>
    )
  }
  return (
    <article className="product-card catalog-card">
      <Link to={`/product/${product.slug}`} aria-label={product.name}>{picture}</Link>
      <div className="catalog-card-copy">
        <Link className="product-category" to={`/collection/${product.categories[0]?.slug || 'meubilair'}`}>
          {productCategory(product)}
        </Link>
        <h3>
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="product-inquire-status">Ask about this piece</p>
      </div>
      <div className="card-actions-row">
        {onAddToCart && (
          <button className="card-action" type="button" onClick={() => onAddToCart(product.slug, 1)}>
            <Icon name="cart" /> Add to cart
          </button>
        )}
        <a
          className="card-action-whatsapp"
          href={`https://wa.me/${ETHIOPIA_CONTACT.whatsappRaw}?text=${encodeURIComponent(
            `Hello Maison Debrah Ethiopia, I would like to inquire about ${product.name} (SKU: ${product.sku || 'N/A'}).`
          )}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Inquire about ${product.name} on WhatsApp`}
          title="Direct WhatsApp inquiry"
        >
          <Icon name="whatsapp" />
        </a>
      </div>
    </article>
  )
}

const featuredImages: Record<string, string> = {
  caslen: 'Caslen-600x600.png',
  ravlen: 'Ravlen-600x600.png',
  savel: 'Savel-1-600x600.png',
  marenza: 'Marenza-1-600x600.png',
  orvella: 'Orvella-600x600.png',
  'vin-gris': 'Vin-Gris-600x600.png',
  chasson: 'Chasson-600x600.png',
  'arvis-2': 'Arvis-600x600.png',
}
const chairImages: Record<string, string> = {
  falion: 'RC25203-1200x1200-1-400x400.jpg',
  aloura: 'DC231221-1-400x400.jpg',
  avelisse: 'DC242431-1-400x400.jpg',
  cerlin: 'DC25039-B-2572-1200x1200-1-400x400.jpg',
  elowen: 'ADC200451-400x400.jpg',
}

function Home({ products }: { products: Product[] }) {
  const featured = ['caslen', 'ravlen', 'savel', 'marenza', 'orvella', 'vin-gris', 'chasson', 'arvis-2']
    .map((slug) => products.find((item) => item.slug === slug))
    .filter((item): item is Product => Boolean(item))
  const chairs = ['falion', 'aloura', 'avelisse', 'cerlin', 'elowen']
    .map((slug) => products.find((item) => item.slug === slug))
    .filter((item): item is Product => Boolean(item))
  const [newsletterStatus, setNewsletterStatus] = useState('')
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)
  const [slideCycleKey, setSlideCycleKey] = useState(0)
  const heroRef = useRef<HTMLElement>(null)
  const lastWheelTimeRef = useRef(0)
  const activeScene = homeShowroomScenes[activeSceneIndex]

  const sceneHighlights: Record<string, string> = {
    'page-03-entry': 'Grand Portals · Calacatta Marble',
    'page-24-room-4': 'Bespoke Seating · Ambient Lighting',
    'page-04-dining-area': 'Sculptural Quartzite · Statement Chandelier',
  }

  const goToSlide = (index: number) => {
    setActiveSceneIndex(index)
    setSlideCycleKey((k) => k + 1)
  }

  const nextSlide = useCallback(() => {
    setActiveSceneIndex((idx) => (idx + 1) % homeShowroomScenes.length)
    setSlideCycleKey((k) => k + 1)
  }, [])

  const prevSlide = useCallback(() => {
    setActiveSceneIndex((idx) => (idx - 1 + homeShowroomScenes.length) % homeShowroomScenes.length)
    setSlideCycleKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) return
      setActiveSceneIndex((index) => (index + 1) % homeShowroomScenes.length)
      setSlideCycleKey((k) => k + 1)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [])

  // Interactive mouse wheel scroll: transitions scenes down/up, then smoothly flows down to content
  useEffect(() => {
    const heroEl = heroRef.current
    if (!heroEl) return

    const onWheel = (e: WheelEvent) => {
      if (window.scrollY > 15) return
      const now = Date.now()
      if (now - lastWheelTimeRef.current < 650) {
        if ((e.deltaY > 0 && activeSceneIndex < homeShowroomScenes.length - 1) || (e.deltaY < 0 && activeSceneIndex > 0)) {
          e.preventDefault()
        }
        return
      }

      if (e.deltaY > 30) {
        if (activeSceneIndex < homeShowroomScenes.length - 1) {
          e.preventDefault()
          lastWheelTimeRef.current = now
          goToSlide(activeSceneIndex + 1)
        }
        // When on the final slide (Dining area), natural wheel continues down to #collection-paths!
      } else if (e.deltaY < -30) {
        if (activeSceneIndex > 0) {
          e.preventDefault()
          lastWheelTimeRef.current = now
          goToSlide(activeSceneIndex - 1)
        }
      }
    }

    heroEl.addEventListener('wheel', onWheel, { passive: false })
    return () => heroEl.removeEventListener('wheel', onWheel)
  }, [activeSceneIndex])

  // Keyboard navigation on hero: ArrowLeft / ArrowRight to switch showroom scenes
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (window.scrollY > 200) return
      if (e.key === 'ArrowRight') {
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        prevSlide()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [nextSlide, prevSlide])

  // Horizontal touch swipe to change showroom scenes on mobile
  useEffect(() => {
    const heroEl = heroRef.current
    if (!heroEl) return

    let startX = 0
    let startY = 0

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const onTouchEnd = (e: TouchEvent) => {
      const diffX = e.changedTouches[0].clientX - startX
      const diffY = e.changedTouches[0].clientY - startY
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
        if (diffX < 0) {
          nextSlide()
        } else {
          prevSlide()
        }
      }
    }

    heroEl.addEventListener('touchstart', onTouchStart, { passive: true })
    heroEl.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      heroEl.removeEventListener('touchstart', onTouchStart)
      heroEl.removeEventListener('touchend', onTouchEnd)
    }
  }, [nextSlide, prevSlide])

  return (
    <main id="main-content">
      <section
        className="showroom-hero"
        aria-label="Maison Debrah showroom"
        aria-roledescription="carousel"
        ref={heroRef}
      >
        <div className="showroom-hero-track">
          {homeShowroomScenes.map((scene, index) => (
            <picture
              className="showroom-hero-slide"
              key={scene.name}
              aria-hidden={index !== activeSceneIndex}
            >
              <source media="(max-width: 800px)" srcSet={asset(`/images/projects/${scene.name}-1600.webp`)} />
              <img src={asset(`/images/projects/${scene.name}-2400.webp`)} alt={scene.alt} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : undefined} />
            </picture>
          ))}
        </div>

        <button
          type="button"
          className="hero-arrow hero-arrow--prev"
          onClick={prevSlide}
          aria-label="Previous showroom scene"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <button
          type="button"
          className="hero-arrow hero-arrow--next"
          onClick={nextSlide}
          aria-label="Next showroom scene"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
        </button>

        <div className="showroom-hero-copy">
          <div className="concept-eyebrow">
            <span className="eyebrow-flag">Flagship Showroom · {activeScene.label}</span>
            <span className="eyebrow-pill">{sceneHighlights[activeScene.name]}</span>
          </div>
          <h1>{HOME_CONTENT.heroTitle}</h1>
          <p>{HOME_CONTENT.heroDescription}</p>
          <div className="showroom-hero-actions">
            <Link className="reference-button hero-primary-btn" to="/projects">
              {HOME_CONTENT.heroButton} <span aria-hidden="true">→</span>
            </Link>
            <Link className="hero-secondary-btn" to="/collection/meubilair">
              Browse collection
            </Link>
          </div>
        </div>

        <div className="showroom-hero-nav" aria-label="Showroom scene selector">
          <div className="showroom-hero-tabs">
            {homeShowroomScenes.map((scene, index) => (
              <button
                type="button"
                key={scene.name}
                className={`hero-scene-tab ${index === activeSceneIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`View ${scene.label}`}
                aria-pressed={index === activeSceneIndex}
              >
                <div className="hero-tab-meta">
                  <span className="hero-tab-num">0{index + 1}</span>
                  <span className="hero-tab-name">{scene.label}</span>
                </div>
                <div className="hero-tab-bar">
                  <div
                    key={`${index}-${slideCycleKey}`}
                    className="hero-tab-fill"
                  />
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="hero-scroll-prompt"
            onClick={() => {
              const target = document.getElementById('collection-paths')
              target?.scrollIntoView({ behavior: 'smooth' })
            }}
            aria-label="Scroll to discover furniture collection"
          >
            <span className="hero-scroll-line" />
            <span>Scroll to explore</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>
      <section id="collection-paths" className="collection-paths" aria-labelledby="collection-paths-title">
        <div className="collection-paths-heading">
          <span>Explore Maison Debrah</span>
          <h2 id="collection-paths-title">Explore by category</h2>
        </div>
        <div className="collection-paths-grid">
          {[
            { name: 'Furniture', slug: 'meubilair', image: '5.jpg' },
            { name: 'Lighting', slug: 'verlichting', image: '4.jpg' },
            { name: 'Decoration', slug: 'decoratie', image: '10.jpg' },
          ].map((category) => (
            <Link
              key={category.slug}
              to={`/collection/${category.slug}`}
              style={{ backgroundImage: `linear-gradient(0deg,rgba(23,36,29,.72),rgba(23,36,29,.05) 65%),url(${reference(category.image)})` }}
            >
              <span>{category.name}</span>
              <b>Explore collection <span aria-hidden="true">→</span></b>
            </Link>
          ))}
        </div>
      </section>
      <section className="reference-featured">
        <h2>{HOME_CONTENT.featuredTitle}</h2>
        <div className="reference-featured-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} image={reference(featuredImages[product.slug])} promo />
          ))}
        </div>
      </section>
      <section
        className="reference-banner"
        style={{ backgroundImage: `linear-gradient(100deg,rgba(42,53,47,.4),rgba(102,93,86,.1)),url(${reference('maison-1.jpg')})` }}
      >
        <div>
          <span>{HOME_CONTENT.catalogueEyebrow}</span>
          <h2>{HOME_CONTENT.catalogueTitle}</h2>
          <Link className="reference-button" to="/catalogue-request">
            View <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <section className="reference-chairs">
        <div className="reference-section-heading">
          <h2>{HOME_CONTENT.chairsTitle}</h2>
          <Link to="/collection/fauteuils-statement-stoelen">View all armchairs &gt;&gt;&gt;</Link>
        </div>
        <div className="reference-chair-grid">
          {chairs.map((product) => (
            <ProductCard key={product.id} product={product} image={reference(chairImages[product.slug])} promo />
          ))}
        </div>
      </section>
      <section className="reference-callouts">
        <Link
          to="/projects"
          style={{ backgroundImage: `linear-gradient(0deg,rgba(23,36,29,.78),rgba(23,36,29,.05) 75%),url(${asset('/images/projects/page-24-room-4-1600.webp')})` }}
        >
          <span>{HOME_CONTENT.showroomEyebrow}</span>
          <h2>{HOME_CONTENT.showroomTitle}</h2>
          <b>See the showroom →</b>
        </Link>
        <Link
          to="/design-consult"
          style={{ backgroundImage: `linear-gradient(100deg,rgba(42,53,47,.4),rgba(102,93,86,.1)),url(${reference('11.jpg')})` }}
        >
          <span>{HOME_CONTENT.consultationEyebrow}</span>
          <h2>{HOME_CONTENT.consultationTitle}</h2>
          <b>Request →</b>
        </Link>
      </section>
      <section
        className="reference-newsletter"
        style={{ backgroundImage: `linear-gradient(100deg,rgba(42,53,47,.5),rgba(42,53,47,.2)),url(${reference('DSCF2467-1.jpg')})` }}
      >
        <div>
          <span>{HOME_CONTENT.newsletterEyebrow}</span>
          <h2>{HOME_CONTENT.newsletterTitle}</h2>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setNewsletterStatus('Thank you. You have been added to our Addis Ababa private preview list.')
          }}
        >
          <input type="email" required aria-label="Email address" placeholder="Email address *" />
          <p>(*) This field is required. We respect your privacy.</p>
          <button className="reference-button" type="submit">
            Sign up
          </button>
          {newsletterStatus && <p role="status">{newsletterStatus}</p>}
        </form>
      </section>
    </main>
  )
}

function CollectionHero({ slug }: { slug?: string }) {
  const category = categories.find((item) => item.slug === slug)
  const parent = topCategories.find((item) => item.id === category?.parent)
  const scene = collectionShowroomScenes[slug || 'all'] || collectionShowroomScenes[parent?.slug || 'all'] || collectionShowroomScenes.all
  const title = slug ? categoryName(slug) : 'Furniture & interiors'

  return (
    <header className="collection-hero">
      <picture className="collection-hero-media">
        <source media="(max-width: 800px)" srcSet={asset(`/images/projects/${scene.image}-640.webp`)} />
        <img src={asset(`/images/projects/${scene.image}-1600.webp`)} alt={scene.alt} fetchPriority="high" />
      </picture>
      <nav className="collection-hero-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">/</span>
        {slug ? <><Link to="/shop">Collection</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></> : <span aria-current="page">Collection</span>}
      </nav>
      <div className="collection-hero-copy">
        <span>Inside our showroom</span>
        <h1>{title}</h1>
        <p>{scene.description}</p>
      </div>
    </header>
  )
}

function Catalog({
  products,
  addToCart,
}: {
  products: Product[]
  addToCart: (slug: string, quantity: number) => void
}) {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') || '').trim().toLowerCase()
  const sort = params.get('sort') || 'featured'
  const pageSize = [12, 24, 50].includes(Number(params.get('perPage'))) ? Number(params.get('perPage')) : 50
  const page = Math.max(1, Number(params.get('page') || '1') || 1)

  const filtered = useMemo(() => {
    const base = slug ? productsInCategory(products, slug) : products
    const result = base.filter((product) => {
      if (!query) return true
      const searchBlob = `${product.name} ${product.sku} ${product.categories.map((item) => categoryName(item.slug, item.name)).join(' ')}`.toLowerCase()
      return searchBlob.includes(query)
    })
    if (sort === 'name') return result.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'name-desc') return result.sort((a, b) => b.name.localeCompare(a.name))
    return result.sort((a, b) => a.shopOrder - b.shopOrder)
  }, [products, slug, query, sort])

  const pageCount = Math.ceil(filtered.length / pageSize)
  const shown = filtered.slice((Math.min(page, Math.max(pageCount, 1)) - 1) * pageSize, Math.min(page, Math.max(pageCount, 1)) * pageSize)
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  return (
    <main id="main-content" className="catalog-page">
      <CollectionHero slug={slug} />
      <div className="catalog-layout">
        <aside className="catalog-sidebar" aria-label="Product categories">
          <form
            className="catalog-search"
            key={params.get('q') || ''}
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              update('q', String(new FormData(event.currentTarget).get('q') || '').trim())
            }}
          >
            <input
              name="q"
              type="search"
              defaultValue={params.get('q') || ''}
              placeholder="Search collection"
              aria-label="Search collection"
            />
            <button type="submit" aria-label="Search collection">
              <Icon name="search" />
            </button>
          </form>
          <nav aria-label="Categories">
            {topCategories.map((category) => (
              <details className="catalog-category" key={category.id}>
                <summary>{categoryName(category.slug)}</summary>
                <Link to={`/collection/${category.slug}`}>View all {categoryName(category.slug).toLowerCase()}</Link>
                {categories
                  .filter((item) => item.parent === category.id)
                  .map((item) => (
                    <Link className={slug === item.slug ? 'current' : ''} to={`/collection/${item.slug}`} key={item.id}>
                      {categoryName(item.slug, item.name)}
                    </Link>
                  ))}
              </details>
            ))}
          </nav>
          <div className="catalog-inquiry-box">
            <h2>Addis Ababa Studio</h2>
            <p>Custom dimensions, luxury fabric swatches, and bespoke finishes available on request.</p>
            <a
              href={`https://wa.me/${ETHIOPIA_CONTACT.whatsappRaw}?text=Hello%20Maison%20Debrah%20Ethiopia,%20I%20have%20an%20inquiry%20regarding%20your%20collection.`}
              target="_blank"
              rel="noreferrer"
            >
              💬 WhatsApp Concierge
            </a>
          </div>
        </aside>
        <div className="catalog-main">
          <div className="catalog-tools">
            <label className="sort-control">
              <span className="visually-hidden">Sort collection</span>
              <select aria-label="Sort collection" value={sort} onChange={(event) => update('sort', event.target.value)}>
                <option value="featured">Featured collection</option>
                <option value="name">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
            </label>
            <label className="page-size">
              <span className="visually-hidden">Products per page</span>
              <select aria-label="Products per page" value={pageSize} onChange={(event) => update('perPage', event.target.value)}>
                <option value="12">Show 12 products</option>
                <option value="24">Show 24 products</option>
                <option value="50">Show 50 products</option>
              </select>
            </label>
          </div>
          {query && <p className="result-count">{filtered.length} piece(s) matching “{params.get('q')}”</p>}
          {shown.length ? (
            <div className="product-grid catalog-products">
              {shown.map((product) => (
                <ProductCard product={product} key={product.id} onAddToCart={addToCart} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No designs found</h2>
              <p>Try searching another name or collection.</p>
              <Link to="/shop">View all pieces</Link>
            </div>
          )}
          {pageCount > 1 && (
            <nav className="pagination" aria-label="Product pages">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  aria-label={`Page ${number}`}
                  aria-current={number === page ? 'page' : undefined}
                  onClick={() => update('page', String(number))}
                >
                  {number}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </main>
  )
}

function ProductPage({
  products,
  addToCart,
}: {
  products: Product[]
  addToCart: (slug: string, quantity: number) => void
}) {
  const { slug } = useParams()
  const product = products.find((item) => item.slug === slug)
  if (!product) return <NotFound />
  return <ProductDetails key={product.slug} product={product} products={products} addToCart={addToCart} />
}

function ProductDetails({
  product,
  products,
  addToCart,
}: {
  product: Product
  products: Product[]
  addToCart: (slug: string, quantity: number) => void
}) {
  const [imageIndex, setImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const related = products
    .filter((item) => item.id !== product.id && item.categories.some((cat) => product.categories.some((current) => current.id === cat.id)))
    .slice(0, 3)

  const singleWhatsAppUrl = `https://wa.me/${ETHIOPIA_CONTACT.whatsappRaw}?text=${encodeURIComponent(
    `Hello Maison Debrah Ethiopia,\n\nI would like to inquire about availability and ordering for:\n- Piece: ${product.name}\n- Quantity: ${quantity}\n- SKU: ${product.sku || 'N/A'}\n- Page: ${window.location.href}`
  )}`

  return (
    <main id="main-content" className="product-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>»</span>
        <Link to="/shop">Collection</Link>
        <span>»</span>
        <span>{product.name}</span>
      </nav>
      <div className="product-detail">
        <div className="product-gallery">
          <div className="main-product-image">
            <ProductImage src={product.images[imageIndex]?.src || product.images[0]?.src} alt={`${product.name} view ${imageIndex + 1}`} />
          </div>
          {product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((image, index) => (
                <button
                  type="button"
                  key={image.src}
                  className={index === imageIndex ? 'selected' : ''}
                  onClick={() => setImageIndex(index)}
                  aria-label={`Show ${product.name} image ${index + 1}`}
                >
                  <ProductImage src={image.thumbnail} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <div className="inquiry-badge">Ask about this piece</div>
          {product.categories[0] && (
            <p className="product-meta">
              Collection: <Link to={`/collection/${product.categories[0].slug}`}>{productCategory(product)}</Link>
            </p>
          )}
          <div className="add-cart">
            <label htmlFor="product-quantity">Quantity</label>
            <input
              id="product-quantity"
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))}
            />
            <button
              className="reference-button"
              type="button"
              onClick={() => {
                addToCart(product.slug, quantity)
                setAdded(true)
              }}
            >
              Add to cart
            </button>
            <a className="reference-button whatsapp-button" href={singleWhatsAppUrl} target="_blank" rel="noreferrer">
              💬 Inquire on WhatsApp
            </a>
          </div>
          {added && (
            <p role="status" className="added-message">
              Added to your cart. <Link to="/cart">View inquiry cart →</Link>
            </p>
          )}
          {product.summary && <p className="product-summary">{product.summary}</p>}
          <p className="commerce-note">
            Contact Maison Debrah Ethiopia for details, availability and delivery information.
          </p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="related-products">
          <h2>Related designs you’ll love</h2>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} onAddToCart={addToCart} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function About() {
  return (
    <StandardPage title="About Maison Debrah Ethiopia" image="maison-1.jpg">
      <h2>Curating extraordinary spaces in Ethiopia</h2>
      <p>
        Maison Debrah Ethiopia brings world-class European furniture design, architectural lighting, and bespoke interior finishes directly to Addis Ababa.
      </p>
      <p>
        From prestigious residential villas and penthouses to boutique hospitality destinations, our pieces merge timeless craftsmanship with contemporary distinction.
      </p>
      <Link className="reference-button" to="/shop">
        Explore the collection
      </Link>
    </StandardPage>
  )
}

function Projects() {
  return (
    <StandardPage title="Inside the Maison Debrah showroom">
      <p className="concept-intro">Explore photographs of our completed showroom, from the entrance and reception to the furnished living, dining and bedroom spaces.</p>
      {projectGroups.map((group) => (
        <section className="concept-group" key={group.title} aria-label={group.title}>
          <h2>{group.title}</h2>
          <div className={`concept-gallery${group.images.length === 1 ? ' concept-gallery--single' : ''}`}>
            {group.images.map((image, index) => (
              <figure className="concept-card" key={image.name}>
                <a href={asset(`/images/projects/${image.name}-1600.webp`)} target="_blank" rel="noreferrer">
                  <img
                    src={asset(`/images/projects/${image.name}-640.webp`)}
                    alt={image.alt}
                    width="640"
                    height="380"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>View full image <span aria-hidden="true">↗</span></span>
                </a>
                <figcaption>{group.title} · View {index + 1}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
      <Link className="reference-button concept-contact" to="/contact">Plan a showroom visit</Link>
    </StandardPage>
  )
}

function Contact() {
  return (
    <StandardPage title="Contact & Addis Ababa Showroom">
      <h2>Visit or contact our team</h2>
      <p>
        <strong>Showroom:</strong> {ETHIOPIA_CONTACT.showroom}<br />
        <strong>WhatsApp & Tel:</strong> {ETHIOPIA_CONTACT.phone}<br />
        <strong>Email:</strong> {ETHIOPIA_CONTACT.email}
      </p>
      <PreviewForm kind="contact" />
    </StandardPage>
  )
}

function StandardPage({ title, children, image }: { title: string; children: React.ReactNode; image?: string }) {
  return (
    <main id="main-content" className="standard-page">
      <div className="page-heading">
        <p><Link to="/">Home</Link> / {title}</p>
        <h1>{title}</h1>
      </div>
      {image && (
        <div className="page-image">
          <img src={reference(image)} alt="Maison Debrah interior" />
        </div>
      )}
      <div className="page-body">{children}</div>
    </main>
  )
}

function PreviewForm({ kind }: { kind: 'contact' | 'catalogue' | 'consult' }) {
  const [status, setStatus] = useState('')
  return (
    <form
      className="reference-form"
      onSubmit={(event) => {
        event.preventDefault()
        setStatus('Thank you! Your inquiry has been received by our Addis Ababa concierge team.')
      }}
    >
      <div className="form-pair">
        <label>First name *<input name="firstName" required /></label>
        <label>Last name *<input name="lastName" required /></label>
      </div>
      <div className="form-pair">
        <label>Email address *<input name="email" type="email" required /></label>
        <label>WhatsApp / Phone<input name="phone" type="tel" placeholder="+251 9..." /></label>
      </div>
      <label>Message / Project Details *<textarea name="message" rows={5} required /></label>
      <button className="reference-button" type="submit">
        {kind === 'catalogue' ? 'Request catalogue' : kind === 'consult' ? 'Request consultation' : 'Send message'}
      </button>
      {status && <p role="status" className="added-message">{status}</p>}
    </form>
  )
}

function CartPage({
  products,
  cart,
  setCart,
}: {
  products: Product[]
  cart: Cart
  setCart: (cart: Cart) => void
}) {
  const items = products.filter((product) => (cart[product.slug] || 0) > 0)
  const totalPieces = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

  const update = (slug: string, amount: number) => {
    const next = { ...cart }
    if (amount <= 0) delete next[slug]
    else next[slug] = Math.min(99, amount)
    setCart(next)
  }

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerLocation, setCustomerLocation] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)

  const generateWhatsAppUrl = () => {
    const lines = [
      `*Maison Debrah Ethiopia — Design Inquiry*`,
      `-----------------------------------------`,
      ...items.map((product, idx) => `${idx + 1}. *${product.name}* (Qty: ${cart[product.slug]})`),
      `-----------------------------------------`,
    ]
    if (customerName.trim()) lines.push(`*Client:* ${customerName.trim()}`)
    if (customerPhone.trim()) lines.push(`*Phone / WhatsApp:* ${customerPhone.trim()}`)
    if (customerLocation.trim()) lines.push(`*Location / Addis Ababa Sub-city:* ${customerLocation.trim()}`)
    if (customerNotes.trim()) lines.push(`*Notes / Requests:* ${customerNotes.trim()}`)
    lines.push(`\nInquired via Maison Debrah Ethiopia website`)
    return `https://wa.me/${ETHIOPIA_CONTACT.whatsappRaw}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!customerName.trim()) {
      alert('Please enter your full name.')
      return
    }
    setFormSubmitted(true)
  }

  return (
    <StandardPage title="Your Curated Selection">
      {items.length ? (
        <div className="cart-container">
          <div className="cart-items-card">
            <div className="cart-card-header">
              <h2>Selected Pieces ({totalPieces})</h2>
              <button className="text-clear-btn" type="button" onClick={() => setCart({})}>
                Clear list
              </button>
            </div>

            <div className="cart-table">
              {items.map((product) => (
                <div className="cart-line" key={product.slug}>
                  <div className="cart-line-thumb">
                    <ProductImage src={product.images[0]?.thumbnail || product.images[0]?.src} alt={product.name} />
                  </div>
                  <div className="cart-line-details">
                    <Link to={`/product/${product.slug}`} className="cart-line-title">
                      {product.name}
                    </Link>
                    <span className="cart-line-cat">{productCategory(product)}</span>
                    <span className="cart-line-badge">Custom Crafted · Addis Ababa</span>
                  </div>
                  <div className="cart-qty-control">
                    <span className="qty-label">Quantity</span>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => update(product.slug, cart[product.slug] - 1)}
                      >
                        –
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        aria-label={`${product.name} quantity`}
                        value={cart[product.slug]}
                        onChange={(event) => update(product.slug, Number(event.target.value) || 1)}
                      />
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => update(product.slug, cart[product.slug] + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="cart-line-remove"
                    type="button"
                    onClick={() => update(product.slug, 0)}
                    aria-label={`Remove ${product.name}`}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer-links">
              <Link className="cart-continue-link" to="/shop">
                ← Continue exploring collection
              </Link>
            </div>
          </div>

          <div className="inquiry-checkout-panel">
            <div className="inquiry-panel-header">
              <span className="inquiry-eyebrow">Direct Concierge Service</span>
              <h2>Complete Your Design Inquiry</h2>
              <p>
                Please enter your details below. You can send your selection directly to our Addis Ababa team on <strong>WhatsApp ({ETHIOPIA_CONTACT.phone})</strong> for immediate response, or submit an online inquiry.
              </p>
            </div>

            {formSubmitted ? (
              <div className="inquiry-success-banner">
                <div className="success-icon">✓</div>
                <div>
                  <strong>Inquiry Received, {customerName.trim()}!</strong>
                  <p>
                    Your request for {items.length} piece(s) has been forwarded to our Addis Ababa concierge desk. We will reach out via {customerPhone.trim() || 'your contact details'} shortly to confirm finishes, lead times, and delivery.
                  </p>
                  <button
                    className="reference-button"
                    style={{ marginTop: '14px' }}
                    type="button"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Edit inquiry details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div className="inquiry-form-grid">
                  <div className="inquiry-field">
                    <label htmlFor="inq-name">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      id="inq-name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Sara Haile"
                    />
                  </div>
                  <div className="inquiry-field">
                    <label htmlFor="inq-phone">
                      Phone / WhatsApp <span className="opt">(Recommended)</span>
                    </label>
                    <input
                      id="inq-phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+251 937 928 215"
                    />
                  </div>
                  <div className="inquiry-field">
                    <label htmlFor="inq-loc">
                      Addis Ababa Sub-city / Neighborhood
                    </label>
                    <input
                      id="inq-loc"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      placeholder="e.g. Bole Medhanialem, Old Airport, Kazanchis, CMC"
                    />
                  </div>
                  <div className="inquiry-field">
                    <label htmlFor="inq-notes">
                      Special Requests / Custom Dimensions
                    </label>
                    <input
                      id="inq-notes"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="e.g. Fabric swatch request, room dimensions, delivery date..."
                    />
                  </div>
                </div>

                <div className="inquiry-methods-title">
                  <span>Choose Your Preferred Submission Method</span>
                </div>

                <div className="inquiry-actions-cards">
                  <div className="inquiry-method-card primary">
                    <div className="method-badge">Direct & Instant</div>
                    <div className="method-header">
                      <span className="method-icon-circle whatsapp">
                        💬
                      </span>
                      <div>
                        <h3>Send via WhatsApp</h3>
                        <p>Instant direct chat with our Addis Ababa design desk ({ETHIOPIA_CONTACT.phone})</p>
                      </div>
                    </div>
                    <a
                      className="inquiry-btn whatsapp-btn"
                      href={generateWhatsAppUrl()}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (!customerName.trim()) {
                          alert('Please enter your Full Name above before sending via WhatsApp.')
                          e.preventDefault()
                        }
                      }}
                    >
                      Send via WhatsApp ({totalPieces} {totalPieces === 1 ? 'piece' : 'pieces'}) →
                    </a>
                  </div>

                  <div className="inquiry-method-card secondary">
                    <div className="method-badge subtle">Email & Call</div>
                    <div className="method-header">
                      <span className="method-icon-circle form">
                        ✉️
                      </span>
                      <div>
                        <h3>Submit Online Form</h3>
                        <p>Our team will prepare a formal catalog proposal and contact you</p>
                      </div>
                    </div>
                    <button className="inquiry-btn form-btn" type="submit">
                      Submit Online Inquiry →
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="inquiry-trust-strip">
              <div className="trust-item">
                <span className="trust-icon">✦</span>
                <div>
                  <strong>Bespoke Consultation</strong>
                  <p>Direct communication with our Addis Ababa showroom team</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">✦</span>
                <div>
                  <strong>Material & Fabric Swatches</strong>
                  <p>Physical leather, velvet, and marble finishes available on request</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">✦</span>
                <div>
                  <strong>White-Glove Delivery</strong>
                  <p>Careful logistics, delivery, and placement across Ethiopia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h2>Your inquiry list is empty</h2>
          <p>Explore our furniture, lighting, and decoration pieces to build your inquiry.</p>
          <Link className="reference-button" to="/shop">
            Explore Collection
          </Link>
        </div>
      )}
    </StandardPage>
  )
}

function AccountPage() {
  return (
    <StandardPage title="My account">
      <div className="account-columns">
        <section>
          <h2>Client Inquiries</h2>
          <p>Clients with active interior projects can coordinate directly with our Addis Ababa design studio.</p>
          <a className="reference-button whatsapp-button" href={`https://wa.me/${ETHIOPIA_CONTACT.whatsappRaw}`} target="_blank" rel="noreferrer">
            💬 Contact Client Concierge
          </a>
        </section>
        <section>
          <h2>Showroom Appointments</h2>
          <p>Private viewings and trade consultations available by appointment at our Bole showroom.</p>
          <Link className="reference-button" to="/contact">
            Request appointment
          </Link>
        </section>
      </div>
    </StandardPage>
  )
}

function CheckoutPage() {
  return (
    <StandardPage title="Inquiry Checkout">
      <p>Inquiries are processed directly through our Addis Ababa showroom via WhatsApp or our online inquiry form.</p>
      <Link className="reference-button" to="/cart">
        View your cart & complete inquiry
      </Link>
    </StandardPage>
  )
}

function ReferenceContentPage({ type }: { type: string }) {
  const pages: Record<string, { title: string; image?: string; body: string }> = {
    hospitality: {
      title: 'Hospitality',
      image: '11.jpg',
      body: 'Maison Debrah Ethiopia supplies luxury furniture and lighting for hotels, lounges, executive residences, and restaurants in Addis Ababa and beyond.',
    },
    'home-interiors': {
      title: 'Home interiors',
      image: '4.jpg',
      body: 'Tailored interior furnishing packages for private villas, penthouses, and residences throughout Ethiopia.',
    },
    'customer-service': {
      title: 'Customer service',
      body: `Contact our Addis Ababa showroom at ${ETHIOPIA_CONTACT.phone} or ${ETHIOPIA_CONTACT.email} for product assistance, dimensions, and white-glove delivery coordination.`,
    },
    faq: {
      title: 'Frequently asked questions',
      body: 'How do orders work? Simply select your desired pieces in the cart and submit via WhatsApp or website form. Our Addis Ababa concierge team will confirm availability, custom fabric choices, lead times, and delivery schedule.',
    },
    shipping: {
      title: 'Ordering & white-glove delivery',
      body: 'We provide specialized white-glove delivery and on-site assembly across Addis Ababa, with bespoke logistics available for regional Ethiopian cities.',
    },
    returns: {
      title: 'Custom orders & inspection',
      body: 'Every piece is inspected upon arrival at our Addis Ababa facility. Custom bespoke orders are handcrafted to your chosen specifications.',
    },
    privacy: {
      title: 'Privacy policy',
      body: 'Maison Debrah Ethiopia is committed to protecting your personal information. Inquiries are handled securely by our local team.',
    },
    terms: {
      title: 'Terms & conditions',
      body: 'Proposals, quotations, and white-glove deliveries are governed by Maison Debrah Ethiopia trade and residential terms.',
    },
    'catalogue-request': {
      title: 'Request a catalogue',
      image: 'maison-1.jpg',
      body: 'Request our comprehensive digital catalogue of European designer furniture, lighting, and decoration.',
    },
    'design-consult': {
      title: 'Design consultation',
      image: '11.jpg',
      body: 'Schedule a personalized interior design consultation with our Addis Ababa team.',
    },
  }
  const page = pages[type]
  if (!page) return <NotFound />
  const formKind = type === 'catalogue-request' ? 'catalogue' : type === 'design-consult' ? 'consult' : null
  return (
    <StandardPage title={page.title} image={page.image}>
      <h2>{page.title}</h2>
      <p>{page.body}</p>
      {formKind && <PreviewForm kind={formKind} />}
    </StandardPage>
  )
}

function FloatingTools({ cart, products }: { cart: Cart; products: Product[] }) {
  const [open, setOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const items = products.filter((product) => (cart[product.slug] || 0) > 0)

  return (
    <>
      <div className="floating-whatsapp">
        <a
          href={`https://wa.me/${ETHIOPIA_CONTACT.whatsappRaw}?text=${encodeURIComponent(
            'Hello Maison Debrah Ethiopia, I have an inquiry.'
          )}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with Addis Ababa showroom on WhatsApp"
          title="Chat on WhatsApp"
        >
          <Icon name="whatsapp" />
        </a>
      </div>

      <button
        className={`luxury-to-top ${showTop ? 'visible' : ''}`}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <Icon name="arrow-up" />
      </button>

      <div className="floating-cart">
        <span>{count}</span>
        <button type="button" aria-label="Open inquiry cart preview" onClick={() => setOpen(!open)}>
          <Icon name="cart" />
        </button>
      </div>
      {open && (
        <div className="cart-preview" role="dialog" aria-label="Cart preview">
          <button className="cart-preview-close" type="button" onClick={() => setOpen(false)} aria-label="Close cart preview">
            ×
          </button>
          <h2>Inquiry Cart ({count})</h2>
          {items.length ? (
            <>
              {items.map((product) => (
                <p key={product.slug}>
                  {cart[product.slug]} ×{' '}
                  <Link to={`/product/${product.slug}`} onClick={() => setOpen(false)}>
                    {product.name}
                  </Link>
                </p>
              ))}
              <Link className="reference-button" to="/cart" onClick={() => setOpen(false)}>
                Proceed to inquiry
              </Link>
            </>
          ) : (
            <>
              <p>Your cart is empty</p>
              <Link to="/shop" onClick={() => setOpen(false)}>
                Explore collection
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}

function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <h1>Page not found</h1>
      <p>This page is not available.</p>
      <Link className="reference-button" to="/">
        Return home
      </Link>
    </main>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [error, setError] = useState(false)
  const [cart, setCart] = useState<Cart>(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}data/products.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Catalogue request failed: ${response.status}`)
        return response.json()
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('Invalid catalogue')
        setProducts(data as Product[])
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError(true)
      })
    return () => controller.abort()
  }, [])

  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const addToCart = (slug: string, quantity: number) =>
    setCart((current) => ({ ...current, [slug]: Math.min(99, (current[slug] || 0) + quantity) }))

  return (
    <>
      <ScrollToTop />
      <Header count={count} />
      {error ? (
        <main id="main-content" className="load-state">
          <h1>Collection unavailable</h1>
          <p>The local catalogue could not be loaded.</p>
          <button className="reference-button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </main>
      ) : !products ? (
        <main id="main-content" className="load-state" role="status">
          Loading collection…
        </main>
      ) : (
        <Routes>
          <Route path="/" element={<Home products={products} />} />
          <Route path="/shop" element={<Catalog products={products} addToCart={addToCart} />} />
          <Route path="/collection/:slug" element={<Catalog products={products} addToCart={addToCart} />} />
          <Route path="/product/:slug" element={<ProductPage products={products} addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage products={products} cart={cart} setCart={setCart} />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          {[
            'hospitality',
            'home-interiors',
            'customer-service',
            'faq',
            'shipping',
            'returns',
            'privacy',
            'terms',
            'catalogue-request',
            'design-consult',
          ].map((path) => (
            <Route path={`/${path}`} element={<ReferenceContentPage type={path} />} key={path} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
      {(products || error) && <Footer />}
      {products && <FloatingTools cart={cart} products={products} />}
    </>
  )
}
