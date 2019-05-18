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

describe("Reading of Posts", () => {

  beforeAll(async done => {
    await mongoose.connect("mongodb://localhost:27017/postifiTest", {
      useNewUrlParser: true,
      useFindAndModify: false
    });
    await postModel.deleteMany({});
    server = app.listen(3004, async () => {
      global.agent = request.agent(server);
      jest.setTimeout(100000);
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

  test('GET /post/getAllPosts', async (done) => {
    const result = await request(app).get('/post/getAllPosts')
    expect(result.body.message).toEqual(expect.any(Array))
    done()
  })

  /*
    **** REQUIRED VALUES IN PAYLOAD ****
    > _id
*/
  test('POST /post/getPost | Incomplete fields', async (done) => {
    const payload = {
      _id: ""
    }

    const result = await request(app)
      .post('/post/getPost')
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(406)
    expect(result.body.success == false && result.body.message === 'No post id provided').toBe(true)
    done()
  })

  test('POST /post/getPost | Success Scenario', async (done) => {
    const payload = {
      _id: tempStore.postId
    }

    const result = await request(app)
      .post('/post/getPost')
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(202)
    expect(result.body.success == true && result.body.message._id == tempStore.postId).toBe(true)
    done()
  })

  test('POST /post/getPost | Invalid _id', async (done) => {
    const payload = {
      _id: '123456789012'
    }

    const result = await request(app)
      .post('/post/getPost')
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(202)
    expect(result.body.success).toBe(true)
    done()
  })

});
