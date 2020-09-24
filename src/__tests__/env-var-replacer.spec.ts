import { envVarReplacer } from "../lib/env-var-replacer";

let TEST;
let TEST2;

beforeAll(() => {
  TEST = process.env.TEST;
  TEST2 = process.env.TEST2;
});

afterAll(() => {
  process.env.TEST = TEST;
  process.env.TEST2 = TEST2;
});
test("env-var-replacer", () => {
  const TEST_CONSTANT = "__TEST__";
  const TEST_2_CONSTANT = "__TEST2__";
  process.env.TEST = TEST_CONSTANT;
  process.env.TEST2 = TEST_2_CONSTANT;

  const result = envVarReplacer({
    npm: [
      {
        package: "whatever",
        rename: {
          something: "{{TEST}}",
        },
      },
    ],
    discourse: [
      {
        forumUrl: "127.0.0.1",
        apiKey: "{{TEST}}",
      },
      {
        forumUrl: "8.8.8.8",
        apiKey: "{{TEST2}}",
      },
    ],
  });
  expect(result.npm[0].rename.something).toBe(TEST_CONSTANT);
  expect(result.discourse[0].apiKey).toBe(TEST_CONSTANT);
  expect(result.discourse[1].apiKey).toBe(TEST_2_CONSTANT);
  expect(result.discourse[0].forumUrl).toBe("127.0.0.1");
});
