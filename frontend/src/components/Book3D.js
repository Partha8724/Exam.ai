import { useRef, useEffect, useState } from 'react';

const TOPICS = [
  { title: 'UPSC', subtitle: 'Civil Services', color: '#D4AF37' },
  { title: 'APSC', subtitle: 'Assam PSC', color: '#B87333' },
  { title: 'ADRE', subtitle: 'Direct Recruit', color: '#D4AF37' },
  { title: 'SSC', subtitle: 'Staff Selection', color: '#B87333' },
  { title: 'Banking', subtitle: 'IBPS & SBI', color: '#D4AF37' },
];

export default function Book3D({ scrollProgress = 0 }) {
  const bookRef = useRef(null);

  const openAngle = Math.min(scrollProgress / 0.3, 1) * 160;
  const pageProgress = Math.max(0, (scrollProgress - 0.25) / 0.75);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1, perspective: '1500px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8%', pointerEvents: 'none', opacity: Math.max(0, 1 - scrollProgress * 3), transition: 'opacity 0.3s ease' }}>
      {/* Ambient particles */}
      <div className="particles-container">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="gold-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      {/* 3D Book */}
      <div
        ref={bookRef}
        className="book-3d"
        style={{
          transform: `rotateY(${scrollProgress * 20}deg) rotateX(-8deg) translateY(${Math.sin(Date.now() * 0.001) * 5}px)`,
        }}
      >
        {/* Book spine */}
        <div className="book-spine" />

        {/* Left cover (front) */}
        <div
          className="book-cover book-cover-front"
          style={{ transform: `rotateY(${openAngle}deg)` }}
        >
          <div className="cover-content">
            <div className="cover-emblem" />
            <div className="cover-title">Exam Prep</div>
            <div className="cover-subtitle">AI-Powered Success</div>
            <div className="cover-line" />
          </div>
        </div>

        {/* Pages */}
        {TOPICS.map((topic, i) => {
          const pageStart = i * 0.18;
          const pageTurn = Math.max(0, Math.min(1, (pageProgress - pageStart) / 0.2));
          const angle = pageTurn * 160;

          return (
            <div
              key={i}
              className="book-page"
              style={{
                transform: `rotateY(${angle}deg)`,
                zIndex: 10 - i,
              }}
            >
              <div className="page-content">
                <div className="page-number">{i + 1}</div>
                <div className="page-topic-title" style={{ color: topic.color }}>
                  {topic.title}
                </div>
                <div className="page-topic-subtitle">{topic.subtitle}</div>
                <div className="page-lines">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="page-line" style={{ width: `${60 + Math.random() * 35}%` }} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Right cover (back) */}
        <div
          className="book-cover book-cover-back"
          style={{ transform: `rotateY(${-openAngle}deg)` }}
        />
      </div>

      {/* Glow effect */}
      <div
        className="book-glow"
        style={{ opacity: 0.15 + scrollProgress * 0.25 }}
      />
    </div>
  );
}
