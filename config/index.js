module.exports = function(env) {
  return ({
    dev: {
      dbUser: 'admin',
      dbPass: process.env.DB_PASS,
      dbAuthdb: 'admin'
    }
  })[env]
}