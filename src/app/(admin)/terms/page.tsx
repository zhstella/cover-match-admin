import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { getTerms } from "@/lib/admin-data";
import { createTerm, deleteTerm, updateTerm } from "./actions";

function TermForm({ action, item, submitLabel }: { action: (formData: FormData) => void | Promise<void>; item?: Record<string, unknown>; submitLabel: string }) {
  return (
    <form action={action} className="settings-form compact">
      <div className="form-grid"><label>Term<input name="term" maxLength={120} defaultValue={String(item?.term ?? "")} required /></label><label>Category<input name="category" maxLength={80} defaultValue={String(item?.category ?? "general")} required /></label></div>
      <label>Definition<textarea name="definition" rows={3} maxLength={1200} defaultValue={String(item?.definition ?? "")} required /></label>
      <label className="check-row"><input name="isActive" type="checkbox" defaultChecked={item ? Boolean(item.is_active) : true} /> Active</label>
      <div className="form-actions"><button className="button button-primary" type="submit">{submitLabel}</button></div>
    </form>
  );
}

export default async function TermsPage() {
  const terms = await getTerms();
  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">Controlled vocabulary</p><h1>Terms</h1><p>Create and maintain language used by the generation system.</p></div><span className="count-pill">{terms.length} terms</span></section>
      <details className="panel create-panel" id="new"><summary><span><small>New record</small><strong>Add term</strong></span><span className="summary-icon">＋</span></summary><div className="form-inset"><TermForm action={createTerm} submitLabel="Create term" /></div></details>
      <section className="record-grid">
        {terms.map((item) => {
          const updateAction = updateTerm.bind(null, item.id);
          const deleteAction = deleteTerm.bind(null, item.id);
          return <article className="panel record-card" key={item.id}>
            <div className="record-heading"><div><span className="mini-label">{item.category}</span><h2>{item.term}</h2></div><span className={item.is_active ? "status-badge success" : "status-badge"}>{item.is_active ? "Active" : "Inactive"}</span></div>
            <p>{item.definition}</p>
            <details className="edit-details"><summary>Edit term</summary><TermForm action={updateAction} item={item} submitLabel="Save term" /></details>
            <form action={deleteAction} className="delete-form"><ConfirmSubmitButton label="Delete term" message={`Delete “${item.term}”?`} /></form>
          </article>;
        })}
      </section>
    </>
  );
}
