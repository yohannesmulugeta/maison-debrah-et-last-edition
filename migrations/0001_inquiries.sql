CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'catalogue', 'consult', 'product')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  notification_status TEXT NOT NULL DEFAULT 'pending' CHECK (notification_status IN ('pending', 'sent', 'failed')),
  notified_at TEXT
);

CREATE INDEX IF NOT EXISTS inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_notification_status ON inquiries (notification_status);
