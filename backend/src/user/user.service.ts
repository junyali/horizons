import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
  private readonly BASE_ID = 'appumOs6hlFGhbv7c';
  private readonly TABLE_NAME = 'tbldJ8CL1xt7qcnrM';
  private readonly EMAIL_TABLE_ID = 'tblFDNhax22eAjSB3';
  private readonly AIRTABLE_API_KEY = process.env.USER_SERVICE_AIRTABLE_API_KEY;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async generateUniqueToken(): Promise<string> {
    let token: string;
    let exists = true;
    
    while (exists) {
      token = randomBytes(32).toString('hex');
      const existingToken = await this.prisma.stickerToken.findUnique({
        where: { token },
      });
      exists = !!existingToken;
    }
    
    return token;
  }

  private async sendRsvpEmailInBackground(email: string, rafflePosition: number): Promise<void> {
    try {
      console.log(`=== SENDING EMAIL IN BACKGROUND ===`);
      console.log(`Email: ${email}, RafflePosition received: ${rafflePosition}`);
      
      let stickerToken: string | null = null;
      
      if (rafflePosition <= 5000) {
        const existingToken = await this.prisma.stickerToken.findFirst({
          where: { email },
        });
        
        if (!existingToken) {
          const token = await this.generateUniqueToken();
          await this.prisma.stickerToken.create({
            data: {
              email,
              token,
              rsvpNumber: rafflePosition,
            },
          });
          stickerToken = token;
        } else {
          stickerToken = existingToken.token;
        }
      }
      
      console.log(`Calling mail service directly with:`, {
        email,
        rsvpNumber: rafflePosition,
        rafflePosition,
        stickerToken,
      });
      
      await this.mailService.sendRsvpEmail(
        email,
        rafflePosition,
        rafflePosition,
        stickerToken
      );
      
      console.log('Successfully sent RSVP confirmation email in background');
    } catch (error) {
      console.error('Error in background email send:', error);
    }
  }

  async createInitialRsvp(email: string, clientIP: string): Promise<void> {
    throw new HttpException(
      'rsvp is not enabled at this moment',
      HttpStatus.BAD_REQUEST,
    );
  }

  private calculateAge(birthday: string): number {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async completeRsvp(
    data: { email: string; firstName: string; lastName: string; birthday: string; referralCode?: string },
    clientIP: string,
  ): Promise<{ rafflePosition: number }> {
    throw new HttpException(
      'rsvp is not enabled at this moment',
      HttpStatus.BAD_REQUEST,
    );
  }

  async getRsvpCount(): Promise<{ count: number }> {
    return { count: 0 };
  }

  async verifyStickerToken(token: string): Promise<{ valid: boolean; email?: string; rsvpNumber?: number }> {
    if (!token) {
      throw new HttpException(
        'Token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const stickerToken = await this.prisma.stickerToken.findUnique({
        where: { token },
      });

      if (!stickerToken) {
        return { valid: false };
      }

      if (stickerToken.isUsed) {
        return { valid: false };
      }

      await this.prisma.stickerToken.update({
        where: { token },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      return {
        valid: true,
        email: stickerToken.email,
        rsvpNumber: stickerToken.rsvpNumber,
      };
    } catch (error) {
      console.error('Error verifying sticker token:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const updateData: any = {};

    if (updateUserDto.firstName !== undefined) {
      updateData.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName !== undefined) {
      updateData.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.birthday !== undefined) {
      updateData.birthday = new Date(updateUserDto.birthday);
    }
    if (updateUserDto.addressLine1 !== undefined) {
      updateData.addressLine1 = updateUserDto.addressLine1;
    }
    if (updateUserDto.addressLine2 !== undefined) {
      updateData.addressLine2 = updateUserDto.addressLine2;
    }
    if (updateUserDto.city !== undefined) {
      updateData.city = updateUserDto.city;
    }
    if (updateUserDto.state !== undefined) {
      updateData.state = updateUserDto.state;
    }
    if (updateUserDto.country !== undefined) {
      updateData.country = updateUserDto.country;
    }
    if (updateUserDto.zipCode !== undefined) {
      updateData.zipCode = updateUserDto.zipCode;
    }
    if (updateUserDto.airtableRecId !== undefined) {
      updateData.airtableRecId = updateUserDto.airtableRecId;
    }

    const user = await this.prisma.user.update({
      where: { userId },
      data: updateData,
    });

    return {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      city: user.city,
      state: user.state,
      country: user.country,
      zipCode: user.zipCode,
      airtableRecId: user.airtableRecId,
      updatedAt: user.updatedAt,
    };
  }
}
