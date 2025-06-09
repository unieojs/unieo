export function encodeErrorMessage(message?: string) {
  if (!message) {
    return message;
  }
  return message.replace(/,/g, '%2C').replace(/\n/g, '; ');
}
