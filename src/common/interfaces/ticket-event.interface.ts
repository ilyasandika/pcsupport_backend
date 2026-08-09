export interface TicketEventData {
  ticketId: number;
  backupAssetTag: string;
  assetTag: string;
  creatorId: number;
  engineerId: number;
  employeeNik: string;
  userNonEmployeeName?: string;
  contact?: string;
}