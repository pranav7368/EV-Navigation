import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginDto, RegisterDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } }))
      throw new ConflictException("An account with this email already exists");
    const passwordHash = await bcrypt.hash(
      dto.password,
      this.config.get<number>("BCRYPT_ROUNDS", 12),
    );
    const user = await this.prisma.user.create({
      data: { email, name: dto.name.trim(), passwordHash },
      select: { id: true, email: true, name: true, role: true },
    });
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException("Invalid email or password");
    return this.issueToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }

  private async issueToken(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }) {
    return {
      accessToken: await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      user,
    };
  }
}
