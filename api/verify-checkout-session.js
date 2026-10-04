// No public session/email lookup while the production payment workflow is being completed.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).json({error:'Contact FOURTH CROWN to verify an earlier payment.'});
}
