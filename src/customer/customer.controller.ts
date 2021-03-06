import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  Request,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerService } from './customer.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { Image } from './model/Image.interface';
import { Observable, from, throwError, of, map, tap } from 'rxjs';
import { Customer } from './schemas/customer.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

export const storage = {
  storage: diskStorage({
    destination: './uploads/customer_images',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async index() {
    return await this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.service.create(createCustomerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.service.update(id, updateCustomerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file);
  // }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  async uploadFile(@UploadedFile() file, @Request() req) {
    const customer_id: string = req.body.customer_id;
    return { image: file.filename };
    // return (
    //   await this.service.updateOne(customer_id, { image: file.filename })
    // ).pipe(
    //   tap((customer: Customer) => console.log(customer)),
    //   map((customer: Customer) => ({ image: customer.image })),
    // );
  }

  @Get('profile-image/:imagename')
  findProfileImage(
    @Param('imagename') imagename,
    @Res() res,
  ): Observable<Object> {
    if (JSON.stringify(imagename) != '"[object FileList]"') {
      return of(
        res.sendFile(
          join(process.cwd(), 'uploads/customer_images/' + imagename),
        ),
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-firstname/:firstname')
  async getFirstname(@Param('firstname') firstname) {
    return await this.service.getfirstname(firstname);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search_by_phonenumber/:phonenumber')
  async searchByPhonenumber(@Param('phonenumber') phonenumber) {
    return await this.service.getByPhonenumber(phonenumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/get-customer-stats')
  async getStats() {
    return await this.service.getCustomerStats();
  }
}
