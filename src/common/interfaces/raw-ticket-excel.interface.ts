export interface RawTicketExcelRow {
  no?: string | number;
  assettag?: string;
  nik?: string;
  pic?: string;
  lokasi?: string;
  permasalahan?: string;
  waktu_mulai?: string | number | Date;
  waktu_selesai?: string | number | Date;
  engineer?: string;
  status?: string;
  penyelesaian?: string;
  contact?: string;
  sla_id?: string | number;
  remarks?: string;
  directorate?: string;
  division?: string;
  department?: string;
  position?: string;
}
