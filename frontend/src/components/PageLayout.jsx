import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AnimatedCursor from './AnimatedCursor.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function PageLayout({ children }) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <>
      <AnimatedCursor />
      <div className="site-shell" id="top">
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </div>
    </>
  );
}
