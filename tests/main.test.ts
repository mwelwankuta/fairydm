import { model, Schema, connect, disconnect } from '../src';

/*
 * To run these tests, you need to have the Firestore emulator running.
 * 1. Install the Firebase CLI: `npm install -g firebase-tools`
 * 2. Set up the emulator: `firebase setup:emulators:firestore`
 * 3. Start the emulator: `firebase emulators:start --only firestore`
 *
 * The test suite will automatically connect to the emulator if it's running on localhost:8080.
 */

interface User {
  name: string;
  email: string;
  age?: number;
}

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
});

const User = model<User>('User', userSchema);

describe('fairydm', () => {
  beforeAll(async () => {
    // Point to the emulator
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    await connect({ projectId: 'test-project' });
  });

  afterAll(async () => {
    // Clean up the database after tests
    await User.deleteMany({});
    await disconnect();
  });

  it('should create and find a user', async () => {
    const userData = {
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
    };

    const user = await User.create(userData);
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.data.name).toBe('Alice');

    const foundUser = await User.findOne({ email: 'alice@example.com' });
    expect(foundUser).toBeDefined();
    expect(foundUser?.data.name).toBe('Alice');
    expect(foundUser?.data.age).toBe(30);
  });

  it('should apply default values', async () => {
    const schemaWithDefault = new Schema({
      name: { type: String, required: true },
      role: { type: String, default: 'user' },
    });
    const TestUser = model<{ name: string; role?: string }>('TestUser', schemaWithDefault);

    const user = await TestUser.create({ name: 'Bob' });
    expect(user.data.role).toBe('user');
    await TestUser.deleteMany({}); // Clean up
  });

  it('should update a document', async () => {
    const user = await User.create({ name: 'Charlie', email: 'charlie@example.com' });
    
    await User.updateOne({ email: 'charlie@example.com' }, { age: 40 });

    const updatedUser = await User.findOne({ email: 'charlie@example.com' });
    expect(updatedUser?.data.age).toBe(40);
  });

  it('should delete a document', async () => {
    await User.create({ name: 'David', email: 'david@example.com' });

    const result = await User.deleteMany({ email: 'david@example.com' });
    expect(result.deletedCount).toBe(1);

    const foundUser = await User.findOne({ email: 'david@example.com' });
    expect(foundUser).toBeNull();
  });
}); 