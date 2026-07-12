import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

/** Ossature commune : header + contenu de page + footer + palette de commandes. */
export default function Layout() {
  const { pathname } = useLocation();

  // Remonte en haut à chaque changement de page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
