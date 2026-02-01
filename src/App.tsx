import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
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
    id: 2,
    title: "Example 4",
    url: "images/Carnet-Rouge-70.jpeg",
  },
  {
    id: 2,
    title: "Example 5",
    url: "images/Carnet-Rouge-71.jpeg",
  },
  {
    id: 2,
    title: "Example 6",
    url: "images/Carnet-Rouge-72.jpeg",
  },
];

const App = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
        <div className="gallery-grid">
          {PORTFOLIO_ITEMS.map((item, index) => (
            <div 
              key={item.id} 
              className="gallery-item"
              onClick={() => setSelectedIndex(index)}
            >
              <img src={item.url} alt={item.title} loading="lazy" />
            </div>
          ))}
        </div>
      </main>

      {/* --- Carousel Overlay --- */}
      {selectedIndex !== null && (
        <div className="modal-overlay" onClick={closeCarousel}>
          {/* Close Button */}
          <button className="close-btn" onClick={closeCarousel}>
            <X size={32} />
          </button>

          {/* Previous Arrow */}
          <button 
            className="nav-btn prev-btn" 
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
          >
            <ChevronLeft size={48} />
          </button>

          {/* Image Content */}
          <div 
            className="carousel-content" 
            onClick={(e) => e.stopPropagation()} /* Stop click passing to overlay */
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
            onClick={(e) => { e.stopPropagation(); showNext(); }}
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;