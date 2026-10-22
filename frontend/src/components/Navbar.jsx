import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { profile } from '../data/profile.js';

const links = [
  { href: '/', label: 'Home' },
  { href: '/#about', label: 'About' },
  { href: '/#skills', label: 'Skills' },
  { href: '/projects', label: 'Projects' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#resume', label: 'Resume' },
  { href: '/#contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const closeMenu = () => setIsOpen(false);
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" to="/" aria-label={`${profile.name} home`} onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">A<span>.</span></span>
          <span className="brand-name">{profile.name}</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => link.href.includes('#') ? (
            <a className="nav-link" href={link.href} key={link.href}>{link.label}</a>
          ) : (
            <NavLink className={linkClass} end={link.href === '/'} key={link.href} to={link.href}>{link.label}</NavLink>
          ))}
          <a className="nav-contact" href={isHome ? '#contact' : '/#contact'}>
            Let’s talk <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </nav>

        <button
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="menu-toggle"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <div id="mobile-navigation">
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              animate={{ opacity: 1, height: 'auto' }}
              aria-label="Mobile navigation"
              className="mobile-nav"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
            >
              {links.map((link) => link.href.includes('#') ? (
                <a className="mobile-nav-link" href={link.href} key={link.href} onClick={closeMenu}>{link.label}</a>
              ) : (
                <NavLink className={linkClass} end={link.href === '/'} key={link.href} onClick={closeMenu} to={link.href}>{link.label}</NavLink>
              ))}
              <a className="mobile-nav-link mobile-contact" href={isHome ? '#contact' : '/#contact'} onClick={closeMenu}>Contact <ArrowUpRight size={16} /></a>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
