import { User } from './user.model';

describe('User', () => {
  it('should create an instance', () => {
    const user = new User(1, 'John Doe', 'Category1', 100, 'Sample description', true, 'https://example.com/pizza.jpg');
    expect(user).toBeTruthy();
  });
});
