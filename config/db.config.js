module.exports = {
  development: {
    username: 'postgres',
    password: 'Test@123',
    database: 'cm-api',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  test: {
    username: "",
    password: "",
    database: "",
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  production: {
    username: "",
    password: "",
    database: "",
    host: "",
    dialect: 'postgres'
  }
}
