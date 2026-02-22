import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsDateAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as string[];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];

          if (!value || !relatedValue) {
            return true;
          }

          const startDate = new Date(relatedValue as string | number | Date);
          const endDate = new Date(value as string | number | Date);

          return endDate >= startDate;
        },
        defaultMessage() {
          return `A data de término deve ser maior ou igual à data de início`;
        },
      },
    });
  };
}
