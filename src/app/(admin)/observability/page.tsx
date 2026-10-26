import { getObservabilityData } from "@/lib/admin-data";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default async function ObservabilityPage() {
  const { requests, responses } = await getObservabilityData();
  const responseByRequest = new Map(responses.map((response) => [response.generation_request_id, response]));
  const succeeded = requests.filter((item) => item.status === "succeeded").length;
  const failed = requests.filter((item) => item.status === "failed").length;
  const completed = succeeded + failed;
  const avgLatency = responses.length ? Math.round(responses.reduce((sum, item) => sum + (item.duration_ms ?? 0), 0) / responses.length) : 0;

  return <>
    <section className="page-heading"><div><p className="eyebrow">Generation telemetry</p><h1>Observability</h1><p>Trace image requests from compiled prompt through the model response.</p></div><span className="count-pill">{requests.length} requests · {responses.length} responses</span></section>
    <section className="stat-grid"><article className="stat-card blue"><span>Requests</span><strong>{requests.length}</strong><p>captured generation attempts</p></article><article className="stat-card green"><span>Success rate</span><strong>{completed ? `${Math.round((succeeded/completed)*100)}%` : "—"}</strong><p>{succeeded} succeeded</p></article><article className="stat-card pink"><span>Failures</span><strong>{failed}</strong><p>requests needing review</p></article><article className="stat-card cream"><span>Avg latency</span><strong>{avgLatency ? `${(avgLatency/1000).toFixed(1)}s` : "—"}</strong><p>provider response time</p></article></section>
    <section className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">Read only</p><h2>Generation requests & LLM responses</h2></div></div><div className="table-wrap"><table className="wide-table"><thead><tr><th>Status</th><th>User</th><th>Provider / model</th><th>Prompt</th><th>Response</th><th>Latency</th><th>Created</th></tr></thead><tbody>{requests.map(request=>{const response=responseByRequest.get(request.id);return <tr key={request.id}><td><span className={`status-badge ${request.status}`}>{request.status}</span></td><td><strong>{request.email}</strong><small className="table-subtext">{request.user_id.slice(0,8)}…</small></td><td><strong>{request.provider}</strong><small className="table-subtext">{request.model}</small></td><td><details className="inline-details"><summary>View prompt</summary><p>{request.request_prompt}</p>{request.user_prompt&&<small>User: {request.user_prompt}</small>}</details></td><td>{response?<details className="inline-details"><summary>{response.http_status??response.status}</summary><p>{response.response_summary||response.finish_reason||"Response captured"}</p></details>:request.error_message||"—"}</td><td>{response?.duration_ms?`${(response.duration_ms/1000).toFixed(1)}s`:"—"}</td><td>{formatDate(request.created_at)}</td></tr>})}</tbody></table>{!requests.length&&<div className="empty-inline">No instrumented generation requests yet. New generations will appear here.</div>}</div></section>
  </>;
}
