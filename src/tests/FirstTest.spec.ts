import { User } from '../models/User'

test('it should be ok', () => {
  const user = new User()

  user.name = 'Eduardo'

  expect(user.name).toEqual('Eduardo')
})
