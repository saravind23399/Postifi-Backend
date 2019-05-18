const request = require('supertest')
const app = require('../../../app')
const config = require('../../../Lib/config')
const mongoose = require('mongoose')
const testConfig = require('../config')

const postModel = require('../../../Models/Post/post')
const commentModel = require('../../../Models/Comment/comment')

let server

let tempstore = {
    postId: '',
    commentId: ''
}

describe('Reading Comments | Path : /comment/getPostComments', () => {
    beforeAll(async (done) => {
        await mongoose.connect('mongodb://localhost:27017/postifiTest', { useNewUrlParser: true })
        server = app.listen(3006, async () => {
            global.agent = request.agent(server);
            jest.setTimeout(10000);
            let payload = {
                idToken: testConfig.idToken,
                postTitle: 'Test Post Title',
                postContent: 'Test Post Content',
                postImageUrl: 'postImageUrl',
                postHyperLinkUrl: 'postHyperLinkUrl'
            }

            let result = await request(app)
                .post('/post/newPost')
                .send(payload)
                .set('Accept', 'application/json')
                .then((response) => {
                    tempstore.postId = response.body.debug._id
                })

            payload = {
                idToken: testConfig.idToken,
                postId: tempstore.postId,
                commentText: 'Comment Text for new Post'
            }

            result = await request(app)
                .post('/comment/newComment')
                .send(payload)
                .set('Accept', 'application/json')
                .then((response) => {
                    tempstore.commentId = response.body.debug._id
                })
            done()
        });
    });

    afterAll(async () => {
        await server.close();
        await commentModel.deleteMany({})
        await postModel.deleteMany({})
        await mongoose.disconnect()
    })

    /*
        **** REQUIRED VALUES IN PAYLOAD ****
        > idToken
        > postId
    */
    test('POST /getPostComments | Success Scenario', async (done) => {
        const payload = {
            idToken: testConfig.idToken,
            postId: tempstore.postId,
        }

        const result = await request(app)
            .post('/comment/getPostComments')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(202)
        expect(result.body.success== true && result.body.message[0]._id == tempstore.commentId).toBe(true)
        done()
    })

    test('POST /getPostComments | Invalid idToken', async (done) => {
        const payload = {
            idToken: '1234444',
            postId: tempstore.postId,
        }

        const result = await request(app)
            .post('/comment/getPostComments')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success== false && result.body.message === 'Unable to validate user. Please login again. ').toBe(true)
        done()
    })

    test('POST /getPostComments | No idToken', async (done) => {
        const payload = {
            postId: tempstore.postId,
        }

        const result = await request(app)
            .post('/comment/getPostComments')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success== false && result.body.message === 'Invalid/Incomplete Values for getting Comments.').toBe(true)
        done()
    })



})