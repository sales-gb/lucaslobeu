interface PageHeaderProps {
  index: string;
  label: string;
  year?: string;
}

export default function PageHeader({ index, label, year }: PageHeaderProps) {
  return (
    <div className="ll-pageheader">
      <span className="ll-mono small-cap muted">{index}</span>
      <span className="ll-mono" style={{ color: 'var(--rule)', userSelect: 'none' }}>|</span>
      <span className="ll-mono small-cap">{label}</span>
      {year && (
        <>
          <span className="ll-mono" style={{ color: 'var(--rule)', userSelect: 'none' }}>|</span>
          <span className="ll-mono small-cap muted">{year}</span>
        </>
      )}
    </div>
  );
}
