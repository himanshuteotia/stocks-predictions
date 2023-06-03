import { Routes } from '../routes.abstract';
import { AngleOneRoute } from './angle-one/angle-one.route';
import { UserRoute } from './users/user.route';

export class RoutesV1 extends Routes {
  public routes(): void {
    this.router.route('/users').get(new UserRoute().get);
    this.router
      .route('/angle-one/history')
      .post(new AngleOneRoute().getHistory);
  }
}
