import Link from "next/link";
import Image from "next/image";

import { getDashboardData } from "@/lib/admin-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

export default async function DashboardPage() {
  const { stats, distribution, recent } = await getDashboardData();
  const maxDistribution = Math.max(...distribution.map((item) => item.count), 1);

  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">Community pulse</p><h1>Overview</h1><p>One clear view of readership, creation, and response.</p></div>
        <Link className="button button-primary" href="/media#new">Add media</Link>
      </section>
      <section className="stat-grid" aria-label="Community statistics">
        <article className="stat-card blue"><span>Profiles</span><strong>{stats.profiles}</strong><p>registered readers</p></article>
        <article className="stat-card green"><span>AI media</span><strong>{stats.generations}</strong><p>covers on the shelf</p></article>
        <article className="stat-card pink"><span>Ratings</span><strong>{stats.ratings}</strong><p>community votes</p></article>
        <article className="stat-card cream"><span>Average match</span><strong>{stats.average ? stats.average.toFixed(1) : "—"}</strong><p>out of five stars</p></article>
      </section>
      <section className="dashboard-grid">
        <article className="panel recent-panel">
          <div className="panel-heading"><div><p className="eyebrow">Latest additions</p><h2>Recent covers</h2></div><Link href="/media">Manage all</Link></div>
          <div className="recent-list">
            {recent.length ? recent.map((item) => (
              <div className="recent-row" key={item.id}>
                <Image alt="" src={item.image_url} width={50} height={58} unoptimized />
                <div><strong>{item.book_title}</strong><span>{item.model}</span></div>
                <div className="row-metrics"><span>★ {item.ratings.length}</span><span>◌ {item.comments.length}</span><time>{formatDate(item.created_at)}</time></div>
              </div>
            )) : <div className="empty-inline">No media has been created yet.</div>}
          </div>
        </article>
        <article className="panel distribution-panel">
          <div className="panel-heading"><div><p className="eyebrow">Rating quality</p><h2>Score distribution</h2></div><span className="comment-count">{stats.comments} comments</span></div>
          <div className="distribution">
            {distribution.map((item) => (
              <div className="distribution-row" key={item.score}>
                <span>{item.score} ★</span><div><i style={{ width: `${(item.count / maxDistribution) * 100}%` }} /></div><strong>{item.count}</strong>
              </div>
            ))}
          </div>
          <p className="panel-note">A compact look at how confidently readers feel each cover fits its book.</p>
        </article>
      </section>
    </>
  );
}
