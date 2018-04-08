const { User, Environ, Device, Org } = require('../model')

async function run () {
  try {
    const org = await Org.model.createOrg({ 
      name: 'unloquer',
      description: 'Un/loquer es un Hackerspace',
      email: 'unloquer@gmail.com',
      city: 'Medellín', 
      country: 'Colombia', 
      location: [-75.6325166, 6.2603084] 
    })

    // Create an User
    const user = await User.createUser({ 
      firstName: 'unloquer', 
      lastName: 'admin', 
      email: 'unloquer@gmail.com', 
      city: 'Medellín', 
      country: 'Colombia'
    })
    
    const member = await User.addOrg(org._id, user._id)

    // const user = User.find({ email: 'unloquer@gmail.com' }).exec()
    // user.then(u => console.log("--->", u))


    console.log('done')
  } catch(e) {
    console.log(e)
  }
}

run()
