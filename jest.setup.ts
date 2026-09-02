import '@testing-library/jest-dom'

// jsdom implements neither of these, and the upload screen uses them to show a
// thumbnail of the chosen photo.
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:preview'
  URL.revokeObjectURL = () => {}
}
