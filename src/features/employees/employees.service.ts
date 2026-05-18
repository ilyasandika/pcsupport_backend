import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse';
import { RawEmployeeCsv } from '../../common/interfaces/raw-employee-csv.interface';
import { EmployeeContractType } from '../../common/enums/contract-type.enum';
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
              nik: row['NOPEG 2'],
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
              status: row['STAT_USER'] == 'ON_BA',
              retireDate: formattedRetireDate,
            };
          });
          Logger.log(mappedData);
          resolve(this.bulkSaveEmployee(mappedData));
        },
      );
    });
  }

  private async bulkSaveEmployee(dto: CreateEmployeeDto[]) {
    return await this.employeeRepository.upsert(dto, {
      conflictPaths: ['nik'],
      skipUpdateIfNoValuesChanged: true,
      upsertType: 'on-conflict-do-update',
    });
  }

  async findAll(): Promise<Employee[]> {
    return await this.employeeRepository.find();
  }

  async findOne(id: number): Promise<Employee> {
    const user = await this.employeeRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`user does not exist`);
    }
    return user;
  }
}
