const mongoose = require('mongoose');

if (process.argv.length < 3) {
  // eslint-disable-next-line no-console
  console.log('Please provide the password as an argument: node mongo.js <password>');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack2022:${password}@cluster0.vd2im.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('person', personSchema);
if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];
  const person = new Person({
    name,
    number,
  });

  person.save().then(() => {
    // eslint-disable-next-line no-console
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} else if (process.argv.length === 3) {
  // eslint-disable-next-line no-console
  console.log('phonebook:');
  Person.find({}).then((result) => {
    result.forEach((person) => {
      // eslint-disable-next-line no-console
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}
