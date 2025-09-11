/**
 * 404 Not Found Middleware
 * Handles requests to non-existent routes
 */

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

export default notFound





