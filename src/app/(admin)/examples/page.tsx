import Image from "next/image";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { getExamples } from "@/lib/admin-data";
import { createExample, deleteExample, updateExample } from "./actions";

function ExampleForm({ action, item, submitLabel }: { action: (formData: FormData) => void | Promise<void>; item?: Record<string, unknown>; submitLabel: string }) {
  return <form action={action} className="settings-form compact">
    <div className="form-grid"><label>Title<input name="title" maxLength={160} defaultValue={String(item?.title ?? "")} required /></label><label>Output URL<input name="outputUrl" type="url" defaultValue={String(item?.output_url ?? "")} placeholder="https://…" /></label></div>
    <label>Prompt<textarea name="prompt" rows={4} maxLength={4000} defaultValue={String(item?.prompt ?? "")} required /></label>
    <label>Notes<textarea name="notes" rows={2} maxLength={1200} defaultValue={String(item?.notes ?? "")} /></label>
    <label className="check-row"><input name="isFeatured" type="checkbox" defaultChecked={Boolean(item?.is_featured)} /> Featured example</label>
    <div className="form-actions"><button className="button button-primary" type="submit">{submitLabel}</button></div>
  </form>;
}

export default async function ExamplesPage() {
  const examples = await getExamples();
  return <>
    <section className="page-heading"><div><p className="eyebrow">Reference library</p><h1>Generation examples</h1><p>Curate prompts and outputs that demonstrate expected AI behavior.</p></div><span className="count-pill">{examples.length} examples</span></section>
    <details className="panel create-panel"><summary><span><small>New record</small><strong>Add AI generation example</strong></span><span className="summary-icon">＋</span></summary><div className="form-inset"><ExampleForm action={createExample} submitLabel="Create example" /></div></details>
    <section className="record-grid">{examples.map((item) => {
      const updateAction = updateExample.bind(null, item.id); const deleteAction = deleteExample.bind(null, item.id);
      return <article className="panel record-card" key={item.id}>
        {item.output_url && <div className="example-image"><Image src={item.output_url} alt="" width={800} height={500} unoptimized /></div>}
        <div className="record-heading"><div><span className="mini-label">{item.is_featured ? "Featured" : "Reference"}</span><h2>{item.title}</h2></div></div>
        <p className="code-preview">{item.prompt}</p>{item.notes && <p>{item.notes}</p>}
        <details className="edit-details"><summary>Edit example</summary><ExampleForm action={updateAction} item={item} submitLabel="Save example" /></details>
        <form action={deleteAction} className="delete-form"><ConfirmSubmitButton label="Delete example" message={`Delete “${item.title}”?`} /></form>
      </article>;
    })}</section>
  </>;
}
