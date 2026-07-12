/** Indicateur de chargement (pleine page ou inline). */
export default function Spinner({ full = false, label = 'Chargement…' }) {
  const spinner = (
    <div style={{ display: 'grid', placeItems: 'center', gap: 12, padding: 40 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: '3px solid var(--line)',
          borderTopColor: 'var(--primary)',
          animation: 'spin .8s linear infinite',
        }}
      />
      <span className="mut" style={{ fontSize: 14, fontWeight: 600 }}>
        {label}
      </span>
    </div>
  );

  if (full) {
    return <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>{spinner}</div>;
  }
  return spinner;
}
