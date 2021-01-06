import Users from '../models/Users'

test('it should be ok', () => {
  const user = new Users()

  user.name = 'Eduardo'

  expect(user.name).toEqual('Eduardo')
})
