import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { plainToInstance } from 'class-transformer';
import {
  DetailEmployeeResponseDto,
  EmployeeResponseDto,
} from './dto/employee-response.dto';

import * as XLSX from 'xlsx';
import { RawEmployeeExcelRow } from '../../common/interfaces/raw-employee-excel.interface';
import { WorkLocationsService } from '../work-locations/work-locations.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly workLocationService: WorkLocationsService,
  ) {}

  async parseExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records: any[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: undefined,
    });

    const locationList = await this.workLocationService.findAll();

    const mappedData: CreateEmployeeDto[] = records.map(
      (row: RawEmployeeExcelRow) => {
        let formattedRetireDate: Date | undefined = undefined;
        if (row['PENSIUN']) {
          const parts = row['PENSIUN'].split('/');
          if (parts.length === 3) {
            const [d, m, y] = parts.map(Number);
            formattedRetireDate = new Date(y, m - 1, d);
          }
        }

        let locationId: number;

        if (isNaN(Number(row['LOKASI_KERJA']))) {
          const foundLocation = locationList.find(
            (loc) =>
              loc.name.toLowerCase() ===
              row['LOKASI_KERJA'].toString().toLowerCase(),
          );
          if (foundLocation) {
            locationId = foundLocation.id;
          } else {
            throw new NotFoundException(
              `${row['LOKASI_KERJA']} not in work location list`,
            );
          }
        } else {
          locationId = Number(row['LOKASI_KERJA']);
        }

        return {
          nik: row['NOPEG'],
          nik2: row['NOPEG 2'],
          name: row['NAMA'],
          position: row['JABATAN'],
          positionId: row['POSITION_ID'],
          fs: row['F_S'],
          mjl: row['MJL'],
          bod: row['BOD'],
          religion: row['AGAMA'],
          directorate: row['DIREKTORAT'],
          division: row['DIVISI'],
          department: row['DEPARTEMEN'],
          status: row['STAT_USER'],
          workLocationId: locationId,
          retireDate: formattedRetireDate,
        };
      },
    );

    return await this.bulkSaveEmployee(mappedData);
  }

  private async bulkSaveEmployee(dto: CreateEmployeeDto[]) {
    return await this.employeeRepository.upsert(dto, {
      conflictPaths: ['nik'],
      skipUpdateIfNoValuesChanged: true,
      upsertType: 'on-conflict-do-update',
    });
  }

  async findAll(forList = false) {
    const employees = await this.employeeRepository.find({
      relations: {
        workLocation: true,
      },
    });
    if (forList) return plainToInstance(EmployeeResponseDto, employees);
    return plainToInstance(DetailEmployeeResponseDto, employees);
  }

  async findOne(
    nik: string,
    externalManager?: EntityManager,
  ): Promise<DetailEmployeeResponseDto> {
    const repository = externalManager
      ? externalManager.getRepository(this.employeeRepository.target)
      : this.employeeRepository;

    const employee = await repository.findOne({
      where: { nik },
      relations: {
        workLocation: true,
        assetAssignments: {
          asset: true,
          employee: true,
        },
        tickets: {
          engineer: true,
        },
      },
      order: {
        assetAssignments: {
          createdAt: 'DESC',
        },
        tickets: {
          createdAt: 'DESC',
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`employee does not exist`);
    }

    return plainToInstance(DetailEmployeeResponseDto, employee);
  }
}
