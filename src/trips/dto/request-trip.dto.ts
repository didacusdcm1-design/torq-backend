import { IsNumber, IsNotEmpty } from 'class-validator';

export class RequestTripDto {
  @IsNumber()
  @IsNotEmpty()
  pickupLat: number;

  @IsNumber()
  @IsNotEmpty()
  pickupLng: number;

  @IsNumber()
  @IsNotEmpty()
  dropoffLat: number;

  @IsNumber()
  @IsNotEmpty()
  dropoffLng: number;
}
