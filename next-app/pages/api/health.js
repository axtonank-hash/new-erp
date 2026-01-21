export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'GegoK12 API is running',
    version: '1.0.0'
  });
}
