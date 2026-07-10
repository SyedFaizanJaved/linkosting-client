export default function StatTile({ label, value, note }) {
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <p className="faint" style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{label}</p>
      <p className="display" style={{ margin: '8px 0 0', fontSize: 26, fontWeight: 700 }}>{value}</p>
      {note && <p className="muted" style={{ margin: '7px 0 0', fontSize: 11.5 }}>{note}</p>}
    </div>
  );
}
