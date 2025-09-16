// Simple async handler to forward errors from async route handlers
export default function asyncHandler(fn) {
  return function wrappedAsyncHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}









