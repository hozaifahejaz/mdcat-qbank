/* The drawing that goes with a question: a structure, a circuit, a ray diagram or a set of shapes. Figures are SVG
   drawn in black on a clear background, stored with the question (questions.figure). They are shown as an image, so
   nothing inside one can run, and turned light-on-dark in the dark theme (app.css .qfig). */
export function Figure({ svg, label }: { svg?: string | null; label?: string }) {
  if (!svg || !svg.trim().startsWith("<svg")) return null;
  return (
    <figure className="qfig">
      <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={label || "Figure for this question"} draggable={false} />
    </figure>
  );
}
