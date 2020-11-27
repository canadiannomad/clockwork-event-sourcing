import 'source-map-support/register';
import logger from '../lib/logger';
import redis from '../lib/redis';

export default abstract class Module {
  public readonly classId: string;
  public abstract registerSharedSQS: boolean = false;
  protected readonly log;

  constructor(classId: string) {
    this.classId = classId;
    this.log = logger(classId + ' Module');
    this.log.info('Loading');
  }
  public _registerSharedSQS(allowedFunctions: Record<string, unknown>): Record<string, unknown> {
    if (this.registerSharedSQS) {
      this.log.info('Registering For Shared SQS');
      allowedFunctions[this.classId] = this;
    }
    return allowedFunctions;
  }

  public async _processSharedSQS(body: Record<string, unknown>): Promise<void> {
    this.log.info('Getting Request from Redis', { requestId: body.request });
    const request = JSON.parse(await redis.get(`minevtsrc-async-${body.request}`));
    this.log.info('Got Request from Redis', { requestId: body.request, request });
    request.hops += 1;
    const retRequest = await this.processSharedSQS(body.request, request);
    this.log.info('Storing Request To Redis', { requestId: body.request, retRequest });
    await redis.set(`minevtsrc-async-${body.request}`, JSON.stringify(retRequest), 'EX', 20);
  }
}
