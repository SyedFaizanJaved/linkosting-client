import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function History() {
  const [drafts, setDrafts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/drafts').then(setDrafts).catch(e => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  return (
    <div>
      <h1>History</h1>
      <table>
        <thead>
          <tr><th>Date</th><th>Article</th><th>Status</th><th>Post</th></tr>
        </thead>
        <tbody>
          {drafts.map(d => (
            <tr key={d.id}>
              <td>{new Date(d.created_at).toLocaleDateString()}</td>
              <td><a href={d.article_url} target="_blank" rel="noreferrer">{d.article_title}</a></td>
              <td><span className={`badge ${d.status}`}>{d.status}</span></td>
              <td>
                {d.linkedin_post_id && (
                  <a href={`https://www.linkedin.com/feed/update/${d.linkedin_post_id}/`} target="_blank" rel="noreferrer">
                    View
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
