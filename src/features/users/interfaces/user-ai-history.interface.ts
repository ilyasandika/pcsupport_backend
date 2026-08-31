export interface TagHistoryItem {
  period: string; // e.g. "2025-01" or "all-time"
  periodLabel: string; // e.g. "Januari 2025" or "Semua Waktu"
  tags: string[];
  updatedAt: string;
}

export interface ReviewHistoryItem {
  period: string; // e.g. "2025-01" or "all-time"
  periodLabel: string; // e.g. "Januari 2025" or "Semua Waktu"
  review: string;
  updatedAt: string;
}
