import { getPromptStudioData } from "@/lib/admin-data";
import { updatePromptMix } from "./actions";

export default async function PromptStudioPage() {
  const { chains, steps, mixes } = await getPromptStudioData();
  const chainNames = new Map(chains.map((chain) => [chain.id, chain.name]));

  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">Prompt governance</p><h1>Prompt studio</h1><p>Inspect prompt chains and steps, then tune how their inputs are mixed.</p></div>
        <span className="count-pill">{chains.length} chains · {steps.length} steps</span>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-heading"><div><p className="eyebrow">Read only</p><h2>Prompt chains</h2></div></div>
          <div className="stack-list">
            {chains.map((chain) => (
              <div className="stack-row" key={chain.id}>
                <div><strong>{chain.name}</strong><p>{chain.description}</p></div>
                <span className={chain.is_active ? "status-badge success" : "status-badge"}>v{chain.version} · {chain.is_active ? "Active" : "Paused"}</span>
              </div>
            ))}
            {!chains.length && <div className="empty-inline">No prompt chains configured.</div>}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading"><div><p className="eyebrow">Read only</p><h2>Chain steps</h2></div></div>
          <div className="stack-list">
            {steps.map((step) => (
              <div className="step-row" key={step.id}>
                <span className="step-number">{step.position}</span>
                <div><strong>{step.name}</strong><small>{chainNames.get(step.prompt_chain_id)}</small><p>{step.template}</p></div>
              </div>
            ))}
            {!steps.length && <div className="empty-inline">No prompt steps configured.</div>}
          </div>
        </article>
      </section>

      <section className="section-block">
        <div className="section-title"><div><p className="eyebrow">Editable configuration</p><h2>Prompt chain mix</h2></div><p>Weights must total 100.</p></div>
        <div className="settings-grid">
          {mixes.map((mix) => {
            const action = updatePromptMix.bind(null, mix.id);
            return (
              <form action={action} className="panel settings-form" key={mix.id}>
                <div><span className="mini-label">{chainNames.get(mix.prompt_chain_id)}</span><h3>Input balance</h3></div>
                <div className="form-grid three">
                  <label>System<input name="systemWeight" type="number" min="0" max="100" defaultValue={mix.system_weight} required /></label>
                  <label>Context<input name="contextWeight" type="number" min="0" max="100" defaultValue={mix.context_weight} required /></label>
                  <label>User<input name="userWeight" type="number" min="0" max="100" defaultValue={mix.user_weight} required /></label>
                </div>
                <label>Notes<textarea name="notes" rows={3} maxLength={600} defaultValue={mix.notes} /></label>
                <div className="form-actions"><button className="button button-primary" type="submit">Update mix</button></div>
              </form>
            );
          })}
        </div>
      </section>
    </>
  );
}
