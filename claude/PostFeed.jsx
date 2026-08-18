export default function PostFeed({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Top 50 Hot Posts</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Post Title</th>
              <th className="px-6 py-3 font-medium w-32 text-right">Sentiment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {posts.map((post, idx) => {
              const score = post.sentiment_score;
              let scoreColor = "text-slate-600 bg-slate-100";
              if (score > 0.05) scoreColor = "text-emerald-700 bg-emerald-100";
              else if (score < -0.05) scoreColor = "text-rose-700 bg-rose-100";

              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {post.title}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${scoreColor}`}>
                      {score > 0 ? '+' : ''}{score.toFixed(3)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
