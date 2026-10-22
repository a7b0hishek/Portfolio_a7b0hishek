export default function SectionHeading({ eyebrow, title, description, id }) {
  return (
    <div className="section-heading" id={id}>
      <p className="eyebrow"><span className="eyebrow-line" />{eyebrow}</p>
      <div className="section-heading-row">
        <h2>{title}</h2>
        {description && <p className="section-description text-pretty">{description}</p>}
      </div>
    </div>
  );
}
