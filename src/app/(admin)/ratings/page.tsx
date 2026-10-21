import { getRatings } from "@/lib/admin-data";

function bookTitle(value: unknown) {
  if (Array.isArray(value)) return value[0]?.book_title ?? "Deleted media";
  if (value && typeof value === "object" && "book_title" in value) return String(value.book_title);
  return "Deleted media";
}

export default async function RatingsPage() {
  const ratings = await getRatings();
  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">Community response</p><h1>Ratings</h1><p>Read every vote and trace it to the corresponding cover.</p></div><span className="count-pill">{ratings.length} ratings</span></section>
      <section className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Score</th><th>Reader</th><th>Book</th><th>Submitted</th><th>Rating ID</th></tr></thead>
        <tbody>{ratings.map((rating) => <tr key={rating.id}><td><span className={`score-badge score-${rating.score}`}>{"★".repeat(rating.score)}<i>{rating.score}/5</i></span></td><td><strong>{rating.readerName}</strong></td><td>{bookTitle(rating.generations)}</td><td>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(rating.created_at))}</td><td><code className="id-code">{rating.id.slice(0, 8)}…</code></td></tr>)}</tbody>
      </table>{!ratings.length && <div className="empty-inline">No ratings have been submitted yet.</div>}</div></section>
    </>
  );
}
