export function stringForDate (date: string, hour: string) {
  const [day, mount, year] = date.split('/')
  return new Date(`${year}/${mount}/${day} ${hour}`)
}
