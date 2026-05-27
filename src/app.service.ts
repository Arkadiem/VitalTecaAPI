import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Bienvenidos a la API de VitalTeca' };
  }
}
