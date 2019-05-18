const request = require('supertest')
const app = require('../../app')
const config = require('../../Lib/config')
const mongoose = require('mongoose')
const testConfig = require('./config')

let server;

let tempStore = {}

describe('Integration Testing', () => {

    beforeAll(async (done) => {
        tempStore = {}
        await mongoose.connect('mongodb://localhost:27017/postifiTest', { useNewUrlParser: true })
        server = app.listen(3000, () => {
            global.agent = request.agent(server);
            done();
        });
    });

    afterAll(async () => {
        await server.close();
        await mongoose.disconnect()
        tempStore = {}
    })

    test('GET /', async (done) => {
        const result = await request(app).get('/')
        expect(result.body.success).toBe(true)
        done()
    })

    test('GET /auth', async (done) => {
        const result = await request(app).get('/auth/ping')
        expect(result.body.success).toBe(true)
        done()
    })

    test('GET /post', async (done) => {
        const result = await request(app).get('/post/ping')
        expect(result.body.success).toBe(true)
        done()
    })

    test('GET /comment', async (done) => {
        const result = await request(app).get('/comment/ping')
        expect(result.body.success).toBe(true)
        done()
    })

    test("POST /auth/google/resolveToken | Invalid Token", async done => {
        const payload = {
            idToken: 'InvalidTokenThisIs'
        };
        const result = await request(app)
            .post("/auth/google/resolveToken")
            .send(payload)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(406)
        expect(
            result.body.success == false && result.body.message === "Cannot verify Google Token. Logout and try again"
        ).toBe(true);
        done();
    });

    test("POST /auth/google/resolveToken | Success Scenario", async done => {
        const payload = {
            idToken: testConfig.idToken
        };
        const result = await request(app)
            .post("/auth/google/resolveToken")
            .send(payload)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(202)
        expect(
            result.body.success
        ).toBe(true);
        done();
    });


})