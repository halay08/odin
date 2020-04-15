import { Test, TestingModule }  from '@nestjs/testing';
import { MonitoringController } from './MonitoringController';

describe('MonitoringController Controller', () => {
  let controller: MonitoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ MonitoringController],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it("should return all good from health check", () => {
      const healthCheck = controller.healthCheck();
     expect(healthCheck).toBe("all good!");
  });

});
