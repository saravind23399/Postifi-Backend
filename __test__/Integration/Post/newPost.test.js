const request = require('supertest')
const app = require('../../../app')
const config = require('../../../Lib/config')
const mongoose = require('mongoose')
const testConfig = require('../config')

const postModel = require('../../../Models/Post/post')

let server;

describe('Creation of new Post | Path : /post/newPost', () => {
    beforeAll(async (done) => {
        await mongoose.connect('mongodb://localhost:27017/postifiTest', { useNewUrlParser: true })
        server = app.listen(3001, () => {
            global.agent = request.agent(server);
            jest.setTimeout(10000);
            done();
        });
    });

    afterAll(async () => {
        await server.close();
        await postModel.deleteMany({})
        await mongoose.disconnect()
    })

    /*
        **** REQUIRED VALUES IN PAYLOAD ****
        > idToken
        > postTitle
        > postContent
        > postImageUrl
        > postHyperLinkUrl
    */
    test('POST /post/newPost', async (done) => {
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
            .expect('Content-Type', /json/)
            .expect(202)
        expect(result.body.success == true && result.body.message === 'Posted successfully!').toBe(true)
        done()
    })

    test('POST /post/newPost | No GoogleToken', async (done) => {
        const payload = {
            idToken: '',
            postTitle: 'Test Post',
            postContent: 'Test Post Content',
            postImageUrl: 'postImageUrl',
            postHyperLinkUrl: 'postHyperLinkUrl'
        }

        const result = await request(app)
            .post('/post/newPost')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success).toBe(false)
        done()
    })

    test('POST /post/newPost | Invalid GoogleToken', async (done) => {
        const payload = {
            idToken: 'thisisainvalidToken',
            postTitle: 'Test Post',
            postContent: 'Test Post Content',
            postImageUrl: 'postImageUrl',
            postHyperLinkUrl: 'postHyperLinkUrl'
        }

        const result = await request(app)
            .post('/post/newPost')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success == false && result.body.message === 'Unable to validate user. Please login again.').toBe(true)
        done()
    })

    test('POST /post/newPost | Incomplete fields', async (done) => {
        const payload = {
            idToken: testConfig.idToken,
            postTitle: '',
            postContent: 'Test Post Content',
            postImageUrl: '',
            postHyperLinkUrl: 'postHyperLinkUrl'
        }

        const result = await request(app)
            .post('/post/newPost')
            .send(payload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(406)
        expect(result.body.success == false && result.body.message === 'Invalid/Incomplete Values for adding a new post.').toBe(true)
        done()
    })
})