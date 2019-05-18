const request = require('supertest')
const app = require('../../../app')
const config = require('../../../Lib/config')
const mongoose = require('mongoose')
const testConfig = require('../config')

const postModel = require('../../../Models/Post/post')
const commentModel = require('../../../Models/Comment/comment')

let server

let tempstore = {
    postId: ''
}

describe('Creation of new Comment | Path : /comment/newComment', () => {
    beforeAll(async (done) => {
        await mongoose.connect('mongodb://localhost:27017/postifiTest', { useNewUrlParser: true })
        server = app.listen(3005, async () => {
            global.agent = request.agent(server);
            jest.setTimeout(10000);
            const payload = {
                idToken: testConfig.idToken,
                postTitle: 'Test Post Title',
                postContent: 'Test Post Content',
                postImageUrl: 'postImageUrl',
                postHyperLinkUrl: 'postHyperLinkUrl'
            }

            const result = await request(app)
                .post('/post/newPost')
                .send(payload)
                .set('Accept', 'application/json')
                .then((response) => {
                    tempstore.postId = response.body.debug._id
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
        > commentTest
    */
    test('POST /comment/newComment | Success Scenario', async (done) => {
        const payload = {
            idToken: testConfig.idToken,
            postId: tempstore.postId,
            commentText: 'Comment Text for new Post'
        }

        const result = await request(app)
            .post('/comment/newComment')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(202)
        expect(result.body.success == true && result.body.message === 'Commented successfully!').toBe(true)
        done()
    })

    test('POST /comment/newComment | Invalid idToken', async (done) => {
        const payload = {
            idToken: '1234555',
            postId: tempstore.postId,
            commentText: 'Comment Text for new Post'
        }

        const result = await request(app)
            .post('/comment/newComment')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success == false && result.body.message === 'Unable to validate user. Please login again. ').toBe(true)
        done()
    })

    test('POST /comment/newComment | No idToken', async (done) => {
        const payload = {
            postId: tempstore.postId,
            commentText: 'Comment Text for new Post'
        }

        const result = await request(app)
            .post('/comment/newComment')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success == false && result.body.message === 'User Not Authenticated. No Google idToken.').toBe(true)
        done()
    })

    test('POST /comment/newComment | Invalid postId', async (done) => {
        const payload = {
            idToken: testConfig.idToken,
            postId: '123456789012',
            commentText: 'Comment Text for new Post'
        }

        const result = await request(app)
            .post('/comment/newComment')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success == false && result.body.message === 'No post found!').toBe(true)
        done()
    })

    test('POST /comment/newComment | Incomplete body.', async (done) => {
        const payload = {
            idToken: testConfig.idToken,
            postId: tempstore.postId,
        }

        const result = await request(app)
            .post('/comment/newComment')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success == false && result.body.message === 'Invalid/Incomplete Values for adding a new comment.').toBe(true)
        done()
    })

})