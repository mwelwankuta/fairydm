import { model, Schema, connect, disconnect } from "../src";

// =================================================================
// Test Setup
// =================================================================

interface Country {
  name: string;
  code: string;
}

interface Address {
  street: string;
  city: string;
  country: Country;
}

interface TestUser {
  name: string;
  age: number;
  tags: string[];
  address: Address;
}

const countrySchema = new Schema<Country>({
  name: { type: String, required: true },
  code: { type: String, required: true },
});

const addressSchema = new Schema<Address>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: countrySchema, required: true },
});

const userSchema = new Schema<TestUser>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  tags: { type: [String], required: true },
  address: { type: addressSchema, required: true },
});

const User = model<TestUser>("QueryUser", userSchema);

beforeAll(async () => {
  // Point to the emulator
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  await connect({ projectId: "test-project" });
});

afterAll(async () => {
  await User.deleteMany({});
  await disconnect();
});

beforeEach(async () => {
  // Seed database
  await User.deleteMany({});
  await User.create({
    name: "Alice",
    age: 25,
    tags: ["a", "b"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      country: { name: "USA", code: "US" },
    },
  });
  await User.create({
    name: "Bob",
    age: 30,
    tags: ["b", "c"],
    address: {
      street: "456 Oak Ave",
      city: "Someplace",
      country: { name: "Canada", code: "CA" },
    },
  });
  await User.create({
    name: "Charlie",
    age: 35,
    tags: ["c", "d"],
    address: {
      street: "789 Pine Ln",
      city: "Anytown",
      country: { name: "USA", code: "US" },
    },
  });
});

// =================================================================
// Query Tests
// =================================================================
describe("Query Operations", () => {
  describe("Equality and Inequality", () => {
    it("should find documents with $eq", async () => {
      const users = await User.find({ age: { $eq: 30 } });
      expect(users).toHaveLength(1);
      expect(users[0].data.name).toBe("Bob");
    });

    it("should find documents with $ne", async () => {
      const users = await User.find({ age: { $ne: 30 } });
      expect(users).toHaveLength(2);
    });
  });

  describe("Comparison Operators", () => {
    it("should find documents with $gt", async () => {
      const users = await User.find({ age: { $gt: 30 } });
      expect(users).toHaveLength(1);
      expect(users[0].data.name).toBe("Charlie");
    });

    it("should find documents with $gte", async () => {
      const users = await User.find({ age: { $gte: 30 } });
      expect(users).toHaveLength(2);
    });

    it("should find documents with $lt", async () => {
      const users = await User.find({ age: { $lt: 30 } });
      expect(users).toHaveLength(1);
      expect(users[0].data.name).toBe("Alice");
    });

    it("should find documents with $lte", async () => {
      const users = await User.find({ age: { $lte: 30 } });
      expect(users).toHaveLength(2);
    });
  });

  describe("Inclusion Operators", () => {
    it("should find documents with $in", async () => {
      const users = await User.find({ age: { $in: [25, 35] } });
      expect(users).toHaveLength(2);
    });

    it("should find documents with $nin", async () => {
      const users = await User.find({ age: { $nin: [25, 35] } });
      expect(users).toHaveLength(1);
      expect(users[0].data.name).toBe("Bob");
    });
  });

  describe("Array Operators", () => {
    it("should find documents with $array_contains", async () => {
      const users = await User.find({ tags: { $array_contains: "b" } });
      expect(users).toHaveLength(2);
    });

    it("should find documents with $array_contains_any", async () => {
      const users = await User.find({
        tags: { $array_contains_any: ["a", "d"] },
      });
      expect(users).toHaveLength(2);
    });
  });

  describe("Nested Queries", () => {
    it("should find documents by querying a nested object", async () => {
      const users = await User.find({ address: { city: "Anytown" } });
      expect(users).toHaveLength(2);
    });

    it("should find documents by querying a deeply nested object", async () => {
      const users = await User.find({ address: { country: { code: "US" } } });
      expect(users).toHaveLength(2);
      const userNames = users.map((u) => u.data.name).sort();
      expect(userNames).toEqual(["Alice", "Charlie"]);
    });
  });

  describe("ID Queries", () => {
    it("should find a document by its _id", async () => {
      const user = await User.findOne({ name: "Alice" });
      expect(user).toBeDefined();

      const foundUser = await User.findOne({ _id: user!.id });
      expect(foundUser).toBeDefined();
      expect(foundUser?.data.name).toBe("Alice");
    });
  });
});
