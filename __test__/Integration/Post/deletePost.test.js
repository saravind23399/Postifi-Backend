const request = require("supertest");
const app = require("../../../app");
const config = require("../../../Lib/config");
const mongoose = require("mongoose");
const testConfig = require("../config");

const postModel = require("../../../Models/Post/post");

let server;

let tempStore = {
  postId: ""
};

describe("Deletion of a Post | Path : /post/deletePost", () => {

  beforeEach(async done => {
    const payload = {
      idToken: testConfig.idToken,
      postTitle: "Test Post Title",
      postContent: "Test Post Content",
      postImageUrl: "postImageUrl",
      postHyperLinkUrl: "postHyperLinkUrl"
    };

    const result = await request(app)
      .post("/post/newPost")
      .send(payload)
      .set("Accept", "application/json");
    tempStore.postId = result.body.debug._id
    done()
  })

  beforeAll(async done => {
    await mongoose.connect("mongodb://localhost:27017/postifiTest", {
      useNewUrlParser: true,
      useFindAndModify: false
    });
    await postModel.deleteMany({});
    server = app.listen(3003, async () => {
      global.agent = request.agent(server);
      jest.setTimeout(100000);
      done()
    });
  });

  afterAll(async () => {
    await server.close();
    await postModel.deleteMany({});
    await mongoose.disconnect();
  });

  /*
    **** REQUIRED VALUES IN PAYLOAD ****
    > idToken
    > _id
*/

  test("POST /post/deletePost | Success Scenario", async done => {
    const payload = {
      idToken: testConfig.idToken,
      _id: tempStore.postId,
    };

    const result = await request(app)
      .post("/post/deletePost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(202)
    expect(
      result.body.success == true &&
      result.body.message === "Post deleted Successfully"
    ).toBe(true);
    done();
  }, 10000);

  test("POST /post/deletePost | No GoogleToken", async done => {
    const payload = {
      idToken: "",
      _id: tempStore.postId,
    };

    const result = await request(app)
      .post("/post/deletePost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(406);
    expect(
      result.body.success == false &&
      result.body.message == "User Not Authenticated. No Google idToken."
    ).toBe(true);
    done();
  }, 10000);

  test("POST /post/editPost | Invalid GoogleToken", async done => {
    const payload = {
      idToken: "invalidGoogleidToken",
      _id: tempStore.postId,
    };

    const result = await request(app)
      .post("/post/deletePost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(406);
    expect(
      result.body.success == false &&
      result.body.message === "Unable to validate user. Please login again. "
    ).toBe(true);
    done();
  }, 10000);

  test("POST /post/deletePost | Incomplete fields", async done => {
    const payload = {
      idToken: testConfig.idToken,
      _id: ""
    };

    const result = await request(app)
      .post("/post/deletePost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(406);
    expect(
      result.body.success == false &&
      result.body.message ===
      "Invalid/Incomplete Values for deleting the post."
    ).toBe(true);
    done();
  }, 10000);

  test("POST /post/deletePost | No Post present", async done => {
    const payload = {
      idToken: testConfig.idToken,
      _id: "123456789012", // Invalid _id
    };
    const result = await request(app)
      .post("/post/deletePost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(406)
    expect(
      result.body.success == false && result.body.message === "No Post found"
    ).toBe(true);
    done();
  }, 10000);


});
