import { Link } from 'react-router-dom';

/** Page 404. */
export default function NotFoundPage() {
  return (
    <div className="p-404">
      <div>
        <div className="big">404</div>
        <h1>Page introuvable</h1>
        <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <Link to="/" className="btn btn-primary btn-lg">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
