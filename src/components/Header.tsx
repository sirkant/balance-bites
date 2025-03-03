
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Apple, User } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Apple className="h-8 w-8 text-primary" />
            <span className="font-semibold text-xl">NutriVision</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary' : 'text-foreground/80 hover:text-primary'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/upload" 
              className={`text-sm font-medium transition-colors ${
                isActive('/upload') ? 'text-primary' : 'text-foreground/80 hover:text-primary'
              }`}
            >
              Upload Meal
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-primary' : 'text-foreground/80 hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
          </nav>

          <div className="hidden md:flex">
            <Button variant="outline" size="sm" className="mr-2">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>

          <button 
            className="md:hidden focus:outline-none" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="py-4 px-4 space-y-3">
            <Link 
              to="/" 
              className={`block py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              }`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              to="/upload" 
              className={`block py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isActive('/upload') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              }`}
              onClick={closeMobileMenu}
            >
              Upload Meal
            </Link>
            <Link 
              to="/dashboard" 
              className={`block py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              }`}
              onClick={closeMobileMenu}
            >
              Dashboard
            </Link>
            <div className="pt-3 flex flex-col space-y-2">
              <Button variant="outline" size="sm" className="justify-center">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button size="sm" className="justify-center">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
