export default function handler(req: any, res: any) {
  return res.status(410).json({ success: false, error: 'Endpoint deprecated. Use POST /api/login.' });
}
