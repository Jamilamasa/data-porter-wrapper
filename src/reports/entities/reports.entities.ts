export class Report {
  reference_id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SUPERSEDED';
  file_url?: string;
  error_message?: string;
}
