import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import './App.css';

// 1. Define our Data Type
interface ArtWork {
  id: number;
  title: string;
  url: string;
}

const PORTFOLIO_ITEMS: ArtWork[] = [
  {
    id: 0,
    title: "Example 1",
    url: "images/Carnet-Rouge-67.jpeg",
  },
  {
    id: 1,
    title: "Example 2",
    url: "images/Carnet-Rouge-68.jpeg",
  },
  {
    id: 2,
    title: "Example 3",
    url: "images/Carnet-Rouge-69.jpeg",
  },
  {
    id: 3,
    title: "Example 4",
    url: "images/Carnet-Rouge-70.jpeg",
  },
  {
    id: 4,
    title: "Example 5",
    url: "images/Carnet-Rouge-71.jpeg",
  },
  {
    id: 5,
    title: "Example 6",
    url: "images/Carnet-Rouge-72.jpeg",
  },
];

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoverType, setHoverType] = useState<'nav' | 'action'>('action');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setIsVisible(true);
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      if (target.closest('.navbar')) {
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
  }, []);

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

const App = () => {
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

    if (isLeftSwipe) {
      showNext();
    } else if (isRightSwipe) {
      showPrev();
    }
  };

  // 3. Navigation Handlers
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

  // 4. Keyboard Support (Arrow Keys + Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      switch (e.key) {
        case 'ArrowRight':
          showNext();
          break;
        case 'ArrowLeft':
          showPrev();
          break;
        case 'Escape':
          closeCarousel();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, showNext, showPrev]);

  // Prevent scrolling the background when modal is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedIndex]);

  return (
    <div className="app">
      {/* --- Navigation --- */}
      <nav className="navbar">
        <h2>Valentin Mardoukhaev</h2>
        <div className="nav-links">
          <a href="#">Work</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </nav>

      {/* --- Main Gallery Grid --- */}
      <main className="container">
        <CustomCursor />
        <div className="gallery-grid">
          {PORTFOLIO_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className="gallery-item"
              onClick={() => setSelectedIndex(index)}
            >
              <img src={item.url} alt={item.title} loading="lazy" />

              {/* The Watermark Tooltip */}
              <div className="item-overlay">
                <span className="item-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- Carousel Overlay --- */}
      {selectedIndex !== null && (
        <div
          className="modal-overlay"
          onClick={closeCarousel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close Button */}
          <button className="close-btn" onClick={closeCarousel}>
            <X size={32} />
          </button>

          {/* Previous Arrow */}
          <button
            className="nav-btn prev-btn"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
          >
            <ChevronLeft size={48} />
          </button>

          {/* Image Content */}
          <div
            className="carousel-content"
            onClick={(e) =>
              e.stopPropagation()
            } /* Stop click passing to overlay */
          >
            <img
              src={PORTFOLIO_ITEMS[selectedIndex].url}
              alt={PORTFOLIO_ITEMS[selectedIndex].title}
              className="carousel-image"
            />
            <div className="carousel-caption">
              {PORTFOLIO_ITEMS[selectedIndex].title}
            </div>
          </div>

          {/* Next Arrow */}
          <button
            className="nav-btn next-btn"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;