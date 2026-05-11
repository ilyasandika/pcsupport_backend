import {
  isEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  isPhoneNumber,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ContactType } from '../../../common/enums/vendor-contact-type.enum';
import { VendorSupportContact } from '../entities/vendor_support_contact.entity';
import parsePhoneNumberFromString from 'libphonenumber-js';

@ValidatorConstraint({ name: 'contactValidator', async: false })
export class ContactValidator implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const object = args.object as VendorSupportContact;

    if (object.type === ContactType.EMAIL) {
      return isEmail(value);
    }

    if (object.type === ContactType.PHONE) {
      return isPhoneNumber(value, 'ID');
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as VendorSupportContact;
    return `${object.type} format not valid`;
  }
}

export class CreateVendorSupportContactDto {
  @IsNumber()
  @IsNotEmpty()
  vendorId: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
    const val = value as string;
    if (
      val?.startsWith('62') ||
      val?.startsWith('+62') ||
      val?.startsWith('08')
    ) {
      return parsePhoneNumberFromString(value as string, 'ID')?.number;
    }
    return value as string;
  })
  @Validate(ContactValidator)
  contact: string;

  @IsEnum(ContactType)
  @IsNotEmpty()
  type: ContactType;
}
