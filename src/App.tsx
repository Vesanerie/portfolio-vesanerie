import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import './App.css';

// --- Data ---
interface ArtWork {
  id: number;
  title: string;
  url: string;
}

const PORTFOLIO_ITEMS: ArtWork[] = [
  { id: 0, title: "Example 1", url: "images/Carnet-Rouge-67.jpeg" },
  { id: 1, title: "Example 2", url: "images/Carnet-Rouge-68.jpeg" },
  { id: 2, title: "Example 3", url: "images/Carnet-Rouge-69.jpeg" },
  { id: 3, title: "Example 4", url: "images/Carnet-Rouge-70.jpeg" },
  { id: 4, title: "Example 5", url: "images/Carnet-Rouge-71.jpeg" },
  { id: 5, title: "Example 6", url: "images/Carnet-Rouge-72.jpeg" },
];

// --- Components ---

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoverType, setHoverType] = useState<'nav' | 'action'>('action');
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setIsVisible(true);
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      // Check if hovering over navbar or links
      if (target.closest('.navbar') || target.tagName === 'A') {
        setHoverType('nav');
      } else {
        setHoverType('action');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [location]); // Re-bind on route change if necessary

  if (!isVisible) return null;

  return (
    <div 
      className={`custom-cursor-wrapper type-${hoverType}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {hoverType === 'action' ? (
        <Target size={28} color="var(--malachite)" strokeWidth={1.5} />
      ) : (
        <div className="cursor-circle" />
      )}
    </div>
  );
};

const About = () => (
  <div className="page-section fade-in">
    <h1>About</h1>
    <div className="text-content">
      <p>
        Valentin Mardoukhaev is a visual artist and photographer. 
        Focusing on high-contrast imagery and surrealist compositions, 
        his work explores the intersection of modern aesthetic and raw emotion.
      </p>
      <p>
        [Bio Placeholder: Add more biographical details here regarding exhibitions, 
        philosophy, or background.]
      </p>
    </div>
  </div>
);

const Contact = () => (
  <div className="page-section fade-in">
    <h1>Contact</h1>
    <div className="contact-info">
      <div className="contact-item">
        <span className="label">Email</span>
        <a href="mailto:mardouv2@gmail.com" className="contact-link">mardouv2@gmail.com</a>
      </div>
      
      <div className="contact-item">
        <span className="label">Phone</span>
        <a href="tel:+330635719984" className="contact-link">+33 06 35 71 99 84</a>
      </div>

      <div className="contact-item">
        <span className="label">Instagram</span>
        <div className="social-links">
          <a href="https://instagram.com/Vesanerie" target="_blank" rel="noopener noreferrer" className="contact-link">@Vesanerie</a>
          <a href="https://instagram.com/Culture_hit_mag" target="_blank" rel="noopener noreferrer" className="contact-link">@Culture_hit_mag</a>
        </div>
      </div>
    </div>
  </div>
);

const Work = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) showNext();
    else if (isRightSwipe) showPrev();
  };

  const closeCarousel = () => setSelectedIndex(null);

  const showNext = useCallback(() => {
    setSelectedIndex((prev) => 
      prev === null ? null : (prev + 1) % PORTFOLIO_ITEMS.length
    );
  }, []);

  const showPrev = useCallback(() => {
    setSelectedIndex((prev) => 
      prev === null ? null : (prev - 1 + PORTFOLIO_ITEMS.length) % PORTFOLIO_ITEMS.length
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'Escape') closeCarousel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, showNext, showPrev]);

  useEffect(() => {
    document.body.style.overflow = selectedIndex !== null ? 'hidden' : 'unset';
  }, [selectedIndex]);

  return (
    <>
      <div className="gallery-grid fade-in">
        {PORTFOLIO_ITEMS.map((item, index) => (
          <div
            key={item.id}
            className="gallery-item"
            onClick={() => setSelectedIndex(index)}
          >
            <img src={item.url} alt={item.title} loading="lazy" />
            <div className="item-overlay">
              <span className="item-title">{item.title}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="modal-overlay"
          onClick={closeCarousel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button className="close-btn" onClick={closeCarousel}>
            <X size={32} />
          </button>
          <button
            className="nav-btn prev-btn"
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
          >
            <ChevronLeft size={48} />
          </button>
          <div className="carousel-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={PORTFOLIO_ITEMS[selectedIndex].url}
              alt={PORTFOLIO_ITEMS[selectedIndex].title}
              className="carousel-image"
            />
            <div className="carousel-caption">
              {PORTFOLIO_ITEMS[selectedIndex].title}
            </div>
          </div>
          <button
            className="nav-btn next-btn"
            onClick={(e) => { e.stopPropagation(); showNext(); }}
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </>
  );
};

// --- Main App ---

const App = () => {
  return (
    <Router>
      <div className="app">
        <CustomCursor />
        
        {/* Navigation */}
        <nav className="navbar">
          <h2>Valentin Mardoukhaev</h2>
          <div className="nav-links">
            <Link to="/">Work</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </nav>

        {/* Routes */}
        <main className="container">
          <Routes>
            <Route path="/" element={<Work />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;