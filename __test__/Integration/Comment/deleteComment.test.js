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

describe('Deleting Comments | Path : /comment/deleteComment', () => {
    beforeAll(async (done) => {
        await mongoose.connect('mongodb://localhost:27017/postifiTest', { useNewUrlParser: true })
        server = app.listen(3007, async () => {
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
        **** REQUIRED VALUES IN BODY ****
        > idToken
        > _id
    */
    test('POST /deleteComment | Success Scenario', async (done) => {
        const payload = {
            idToken: testConfig.idToken,
            _id: tempstore.commentId,
        }

        const result = await request(app)
            .post('/comment/deleteComment')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(202)
        expect(result.body.success == true && result.body.message == 'Comment deleted Successfully ').toBe(true)
        done()
    })

    test('POST /getPostComments | Invalid idToken', async (done) => {
        const payload = {
            idToken: '1234444',
            _id: tempstore.commentId,
        }

        const result = await request(app)
            .post('/comment/deleteComment')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success == false && result.body.message === 'Unable to validate user. Please login again. ').toBe(true)
        done()
    })

    test('POST /deleteComments | No idToken', async (done) => {
        const payload = {
            _id: tempstore.commentId,
        }

        const result = await request(app)
            .post('/comment/deleteComment')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success == false && result.body.message === 'User Not Authenticated. No Google idToken.').toBe(true)
        done()
    })

    test('POST /deleteComments | Invalid body', async (done) => {
        const payload = {
            idToken: testConfig.idToken,
        }

        const result = await request(app)
            .post('/comment/deleteComment')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success == false && result.body.message === 'Invalid/Incomplete Values for deleted the Comment.').toBe(true)
        done()
    })




})