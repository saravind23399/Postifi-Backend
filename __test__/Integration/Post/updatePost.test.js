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

describe("Updation of a Post | Path : /post/editPost", () => {
  beforeAll(async done => {
    await mongoose.connect("mongodb://localhost:27017/postifiTest", {
      useNewUrlParser: true,
      useFindAndModify: false
    });
    await postModel.deleteMany({});
    server = app.listen(3002, async () => {
      global.agent = request.agent(server);
      jest.setTimeout(10000);
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
      tempStore.postId = result.body.debug._id;
      done();
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
    > postTitle
    > postContent
    > postImageUrl
    > postHyperLinkUrl
*/

  test("POST /post/editPost | Success Scenario", async done => {
    const payload = {
      idToken: testConfig.idToken,
      _id: tempStore.postId,
      postTitle: "Test Post Title",
      postContent: "Test Post Content",
      postImageUrl: "postImageUrl",
      postHyperLinkUrl: "postHyperLinkUrl"
    };

    const result = await request(app)
      .post("/post/editPost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(202);
    expect(
      result.body.success == true &&
        result.body.message === "Post updated Successfully"
    ).toBe(true);
    done();
  });

  test("POST /post/editPost | No GoogleToken", async done => {
    const payload = {
      idToken: "",
      _id: tempStore.postId,
      postTitle: "Test Post Title",
      postContent: "Test Post Content",
      postImageUrl: "postImageUrl",
      postHyperLinkUrl: "postHyperLinkUrl"
    };

    const result = await request(app)
      .post("/post/editPost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(406);
    expect(
      result.body.success == false &&
        result.body.message == "User Not Authenticated. No Google idToken."
    ).toBe(true);
    done();
  });

  test("POST /post/editPost | Invalid GoogleToken", async done => {
    const payload = {
      idToken: "invalidGoogleidToken",
      _id: tempStore.postId,
      postTitle: "Test Post Title",
      postContent: "Test Post Content",
      postImageUrl: "postImageUrl",
      postHyperLinkUrl: "postHyperLinkUrl"
    };

    const result = await request(app)
      .post("/post/editPost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(406);
    expect(
      result.body.success == false &&
        result.body.message === "Unable to validate user. Please login again."
    ).toBe(true);
    done();
  });


  test("POST /post/editPost | Incomplete fields", async done => {
    const payload = {
      idToken: testConfig.idToken,
      _id: tempStore.postId,
      postTitle: "",
      postContent: "Test Post Content",
      postImageUrl: "postImageUrl",
      postHyperLinkUrl: "postHyperLinkUrl"
    };

    const result = await request(app)
      .post("/post/editPost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(406);
    expect(
      result.body.success == false &&
        result.body.message ===
          "Invalid/Incomplete Values for editing the post."
    ).toBe(true);
    done();
  });

  test("POST /post/editPost | No Post present", async done => {
    const payload = {
      idToken: testConfig.idToken,
      _id: "123456789012", // Invalid _id
      postTitle: "Post Modified",
      postContent: "Test Post Content",
      postImageUrl: "postImageUrl",
      postHyperLinkUrl: "postHyperLinkUrl"
    };
    const result = await request(app)
      .post("/post/editPost")
      .send(payload)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(406)
    expect(
      result.body.success == false && result.body.message === "No Post found"
    ).toBe(true);
    done();
  });
});
