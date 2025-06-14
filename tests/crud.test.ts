import { model, Schema, connect, disconnect } from "../src";

// =================================================================
// Test Setup
// =================================================================
interface User {
  name: string;
  email: string;
  age?: number;
  role?: string;
}

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
  role: { type: String, default: "user" },
});

const User = model<User>("User", userSchema);

beforeAll(async () => {
  // Point to the emulator
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  await connect({ projectId: "test-project" });
});

afterAll(async () => {
  // Clean up the database after all tests
  await User.deleteMany({});
  await disconnect();
});

afterEach(async () => {
  // Clean up the database after each test
  await User.deleteMany({});
});

// =================================================================
// CRUD Tests
// =================================================================
describe("CRUD Operations", () => {
  it("should create a user with Model.create()", async () => {
    const userData = {
      name: "Alice",
      email: "alice@example.com",
      age: 30,
    };

    const user = await User.create(userData);
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.data.name).toBe("Alice");

    const foundUser = await User.findOne({ email: "alice@example.com" });
    expect(foundUser).toBeDefined();
    expect(foundUser?.data.name).toBe("Alice");
  });

  it("should create a user with instance.save()", async () => {
    const newUser = new User({ name: "Bob", email: "bob@example.com" });
    await newUser.save();

    expect(newUser.id).toBeDefined();

    const foundUser = await User.findOne({ email: "bob@example.com" });
    expect(foundUser).toBeDefined();
    expect(foundUser?.data.name).toBe("Bob");
  });

  it("should update a user with instance.save()", async () => {
    const user = await User.create({
      name: "Charlie",
      email: "charlie@example.com",
    });

    user.data.age = 40;
    await user.save();

    const updatedUser = await User.findOne({ email: "charlie@example.com" });
    expect(updatedUser?.data.age).toBe(40);
  });

  it("should apply default values on creation", async () => {
    const user = await User.create({
      name: "David",
      email: "david@example.com",
    });
    expect(user.data.role).toBe("user");
  });

  it("should throw validation error for missing required fields", async () => {
    await expect(User.create({ name: "MissingEmail" } as any)).rejects.toThrow(
      "Validation failed"
    );
  });

  it("should find multiple users with Model.find()", async () => {
    await User.create({ name: "Eve", email: "eve@example.com", age: 25 });
    await User.create({ name: "Frank", email: "frank@example.com", age: 25 });

    const users = await User.find({ age: 25 });
    expect(users).toHaveLength(2);
  });

  it("should fetch all users with Model.find({})", async () => {
    await User.create({ name: "User1", email: "user1@example.com" });
    await User.create({ name: "User2", email: "user2@example.com" });

    const allUsers = await User.find({});
    expect(allUsers).toHaveLength(2);
  });

  it("should update a single document with Model.updateOne()", async () => {
    const user = await User.create({
      name: "Grace",
      email: "grace@example.com",
    });

    const result = await User.updateOne(
      { email: "grace@example.com" },
      { age: 45 }
    );
    expect(result.modifiedCount).toBe(1);

    const updatedUser = await User.findOne({ email: "grace@example.com" });
    expect(updatedUser?.data.age).toBe(45);
  });

  it("should update multiple documents with Model.updateMany()", async () => {
    await User.create({ name: "Heidi", email: "heidi@example.com", age: 30 });
    await User.create({ name: "Ivan", email: "ivan@example.com", age: 30 });

    const result = await User.updateMany({ age: 30 }, { age: 31 });
    expect(result.modifiedCount).toBe(2);

    const users = await User.find({ age: 31 });
    expect(users).toHaveLength(2);
  });

  it("should delete a document with Model.findByIdAndDelete()", async () => {
    const user = await User.create({ name: "Judy", email: "judy@example.com" });
    expect(user.id).toBeDefined();

    const result = await User.findByIdAndDelete(user.id!);
    expect(result.deletedCount).toBe(1);

    const foundUser = await User.findOne({ email: "judy@example.com" });
    expect(foundUser).toBeNull();
  });

  it("should delete multiple documents with Model.deleteMany()", async () => {
    await User.create({
      name: "Mallory",
      email: "mallory@example.com",
      age: 50,
    });
    await User.create({ name: "Trent", email: "trent@example.com", age: 50 });

    const result = await User.deleteMany({ age: 50 });
    expect(result.deletedCount).toBe(2);

    const foundUsers = await User.find({ age: 50 });
    expect(foundUsers).toHaveLength(0);
  });
});
