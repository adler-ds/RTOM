import { Router, Request, Response, NextFunction } from 'express';
import { IntegrationService } from '../services/integration.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

export class LoyaltyController {
  public router: Router;
  private integrationService: IntegrationService;

  constructor(integrationService: IntegrationService) {
    this.router = Router();
    this.integrationService = integrationService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/member/lookup', this.lookupMember.bind(this));
    this.router.get('/member/:memberId/vouchers', this.getVouchers.bind(this));
    this.router.post('/member/redeem-voucher', this.redeemVoucher.bind(this));
    this.router.post('/calculate-points', this.calculatePoints.bind(this));
  }

  private async lookupMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { phone, email, memberNumber } = req.query;

      if (!phone && !email && !memberNumber) {
        res.status(400).json({
          success: false,
          error: 'Please provide phone, email, or memberNumber',
        });
        return;
      }

      let result;
      
      if (memberNumber) {
        result = await this.integrationService.lookupMember(
          memberNumber as string,
          'number'
        );
      } else if (phone) {
        result = await this.integrationService.lookupMember(
          phone as string,
          'phone'
        );
      } else if (email) {
        result = await this.integrationService.lookupMember(
          email as string,
          'email'
        );
      }

      res.json(result);
    } catch (error: any) {
      logger.error('Error in member lookup', { error: error.message });
      next(error);
    }
  }

  private async getVouchers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { memberId } = req.params;

      const vouchers = await this.integrationService.getAvailableVouchers(memberId);

      res.json({
        success: true,
        vouchers,
      });
    } catch (error: any) {
      logger.error('Error fetching vouchers', { error: error.message });
      next(error);
    }
  }

  private async redeemVoucher(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const schema = Joi.object({
        voucherId: Joi.string().required(),
        transactionId: Joi.string().required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const success = await this.integrationService.redeemVoucher(
        value.voucherId,
        value.transactionId
      );

      res.json({
        success,
        message: success ? 'Voucher redeemed successfully' : 'Failed to redeem voucher',
      });
    } catch (error: any) {
      logger.error('Error redeeming voucher', { error: error.message });
      next(error);
    }
  }

  private async calculatePoints(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const schema = Joi.object({
        amount: Joi.number().min(0).required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const calculation = this.integrationService.calculatePoints(value.amount);

      res.json({
        success: true,
        calculation,
      });
    } catch (error: any) {
      logger.error('Error calculating points', { error: error.message });
      next(error);
    }
  }
}
