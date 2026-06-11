export function CardGrid({ items }: { items: { title: string; value: string | number; note?: string }[] }) {
  return (
    <div className="grid">
      {items.map(item => (
        <div className="card" key={item.title}>
          <p>{item.title}</p>
          <h2>{item.value}</h2>
          {item.note && <small>{item.note}</small>}
        </div>
      ))}
    </div>
  );
}
