import type { Book, MediaRecord } from "@/lib/admin-data";

export function MediaForm({
  books,
  action,
  media,
  submitLabel,
}: {
  books: Book[];
  action: (formData: FormData) => void | Promise<void>;
  media?: MediaRecord;
  submitLabel: string;
}) {
  return (
    <form action={action} className="media-form">
      <label>
        Book
        <select name="bookId" defaultValue={media?.book_id ?? ""} required>
          <option disabled value="">Choose a book</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>{book.title} — {book.author}</option>
          ))}
        </select>
      </label>
      <label>
        Image URL
        <input name="imageUrl" type="url" defaultValue={media?.image_url} placeholder="https://…" required />
      </label>
      <div className="form-grid">
        <label>
          Model
          <input name="model" defaultValue={media?.model ?? "admin-import"} maxLength={100} required />
        </label>
        <label>
          Creator direction
          <input name="creatorPrompt" defaultValue={media?.creator_prompt ?? ""} maxLength={360} placeholder="Optional public prompt" />
        </label>
      </div>
      <label>
        Full generation prompt
        <textarea name="prompt" defaultValue={media?.prompt} maxLength={1200} rows={4} required />
      </label>
      <div className="form-actions">
        <button className="button button-primary" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
