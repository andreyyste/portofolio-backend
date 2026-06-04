import { Controller, Post, Body } from '@nestjs/common';
import { ContactService, ContactDto } from './contact.service';
import { IsString, IsEmail, IsNotEmpty, Length } from 'class-validator';

export class SendMessageDto implements ContactDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters.' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 5000, {
    message: 'Message must be between 10 and 5000 characters.',
  })
  message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.contactService.sendContactMessage(dto);
  }
}
