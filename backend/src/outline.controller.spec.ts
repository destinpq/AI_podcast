import { Test, TestingModule } from '@nestjs/testing';
import { OutlineController } from './outline.controller';

describe('OutlineController', () => {
  let controller: OutlineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OutlineController],
    }).compile();

    controller = module.get<OutlineController>(OutlineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
