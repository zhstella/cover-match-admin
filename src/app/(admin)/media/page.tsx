import Image from "next/image";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { MediaForm } from "@/components/media-form";
import { getMediaData } from "@/lib/admin-data";
import { createMedia, deleteMedia, updateMedia } from "./actions";

function average(scores: { score: number }[]) {
  return scores.length ? (scores.reduce((sum, item) => sum + item.score, 0) / scores.length).toFixed(1) : "—";
}

export default async function MediaPage() {
  const { media, books } = await getMediaData();
  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">Content operations</p><h1>AI-generated media</h1><p>Create, review, update, or remove covers from the public gallery.</p></div><span className="count-pill">{media.length} covers</span></section>
      <details className="panel create-panel" id="new"><summary><span><small>New record</small><strong>Add AI media</strong></span><span className="summary-icon">＋</span></summary><div className="form-inset"><MediaForm books={books} action={createMedia} submitLabel="Create media" /></div></details>
      <section className="media-admin-grid">
        {media.map((item, index) => {
          const updateAction = updateMedia.bind(null, item.id);
          const deleteAction = deleteMedia.bind(null, item.id);
          return <article className="media-admin-card" key={item.id}>
            <div className="media-image-wrap"><Image alt={`AI cover for ${item.book_title}`} src={item.image_url} width={720} height={540} loading={index === 0 ? "eager" : "lazy"} unoptimized /></div>
            <div className="media-card-body"><div className="media-title"><div><p className="eyebrow">{item.model}</p><h2>{item.book_title}</h2></div><span className="rating-chip">★ {average(item.ratings)}</span></div>
              <p className="prompt-preview">{item.creator_prompt || item.prompt}</p>
              <div className="media-meta"><span>{item.ratings.length} ratings</span><span>{item.comments.length} comments</span></div>
              <details className="edit-details"><summary>Edit record</summary><MediaForm books={books} action={updateAction} media={item} submitLabel="Save changes" /></details>
              <form action={deleteAction} className="delete-form"><ConfirmSubmitButton label="Delete media" /></form>
            </div>
          </article>;
        })}
      </section>
    </>
  );
}
