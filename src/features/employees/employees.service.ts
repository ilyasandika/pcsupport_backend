import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse';
import { RawEmployeeCsv } from '../../common/interfaces/raw-employee-csv.interface';
import { EmployeeContractType } from '../../common/enums/contract-type.enum';
import { EmployeeStatus } from '../../common/enums/employee-status.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async parseCsv(buffer: Buffer) {
    return new Promise((resolve, reject) => {
      parse(
        buffer,
        {
          columns: true,
          skip_empty_lines: true,
          bom: true,
        },
        (err, records: RawEmployeeCsv[]) => {
          if (err) return reject(err);

          const mappedData: CreateEmployeeDto[] = records.map((row) => {
            const contractType =
              row['STATUS'] == 'ORGANIK'
                ? EmployeeContractType.Organic
                : EmployeeContractType.Pkwt;
            let formattedRetireDate = new Date(2030, 10, 10);
            if (row['PENSIUN']) {
              const [d, m, y] = row['PENSIUN'].split('/').map(Number);
              formattedRetireDate = new Date(y, m - 1, d);
            }
            return {
              employeeId: row['NOPEG 2'],
              name: row['NAMA'],
              contractType: contractType,
              position: row['JABATAN'],
              positionId: row['POSITION_ID'],
              fs: row['F_S'],
              mjl: row['MJL'],
              bod: row['BOD'],
              religion: row['AGAMA'],
              directorate: row['DIREKTORAT'],
              division: row['DIVISI'],
              department: row['DEPARTEMEN'],
              status:
                row['STAT_USER'] == 'ON_BA'
                  ? EmployeeStatus.On
                  : EmployeeStatus.Off,
              retireDate: formattedRetireDate,
            };
          });

          resolve(this.bulkSaveEmployee(mappedData));
        },
      );
    });
  }
  async bulkSaveEmployee(dto: CreateEmployeeDto[]) {
    return await this.employeeRepository.save(dto);
  }
}
