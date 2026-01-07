// UI/UX Constants
export const MESSAGE_AUTO_DISMISS_DELAY = 3000; // milliseconds
export const MESSAGE_POLL_INTERVAL = 3000; // milliseconds
export const MIN_PASSWORD_LENGTH = 8;

// Status Badge Classes
export const STATUS_BADGES = {
  chatting: { emoji: '💬', text: 'Chatting', class: 'badge-info' },
  requested_pen_pal: { emoji: '📮', text: 'Pen Pal Requested', class: 'badge-warning' },
  mutual_pen_pal: { emoji: '✨', text: 'Pen Pals', class: 'badge-primary' },
  address_requested: { emoji: '🔐', text: 'Address Reveal Requested', class: 'badge-warning' },
  revealed: { emoji: '🎉', text: 'Addresses Revealed', class: 'badge-success' }
};
