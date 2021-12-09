const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

const { readFileSync } = require("fs");
let accessToken = readFileSync("./test/accessToken.txt", "utf-8");

const url = "/privilege";

describe("privilege Test", () => {
    /**
     * Test the post
     */
    const randomAction = Math.floor(Math.random() * 1000000);
    describe("/privilege post test", () => {
        it("Should post a new privilege", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    action: `${randomAction}`,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("should return error 400, privilege already exists", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    action: `${randomAction}`,
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("action");
                    done();
                });
        });
    });
    /**
     * Test the get
     */
    let randomGottenId; //this is to make sure delete later works
    describe("Get Test", () => {
        it("should get users", (done) => {
            chai.request(server)
                .get(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    limit: 10,
                })
                .end((_err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("array");
                    randomGottenId = response.body[1].id;
                    done();
                });
        });
        it("should return 400, and no access token", (done) => {
            chai.request(server)
                .get(url)
                .send({
                    limit: 10,
                })
                .end((_err, response) => {
                    response.should.have.status(401);
                    response.body.should.be.a("object");
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("accessToken");
                    done();
                });
        });
    });

    /**
     * Test the delete
     */

    describe("/privilege delete", () => {
        it("Should delete a privilege", (done) => {
            chai.request(server)
                .delete(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id: randomGottenId,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("Should return error 400(no privilege id sent)", (done) => {
            chai.request(server)
                .delete(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({})
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.be.a("object");
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("id");
                    done();
                });
        });
    });

    /**
     * Test the patch
     */

    describe("/privilege patch", () => {
        it("Should update a privilege", (done) => {
            chai.request(server)
                .patch(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id: 2,

                    updateData: {
                        action: "randomAction",
                    },
                    concurrency_stamp: "random",
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("Should send 400 error message", (done) => {
            chai.request(server)
                .patch(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    updateData: {
                        username: "yared terefe",
                    },
                    concurrency_stamp: "random",
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.be.a("object");
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("id");
                    done();
                });
        });
        it("Should send 400 error message", (done) => {
            chai.request(server)
                .patch("/account")
                .send({
                    id: 1,
                    updateData: {
                        username: "yared terefe",
                    },
                    concurrency_stamp: "random",
                })
                .end((err, response) => {
                    response.should.have.status(401);
                    response.body.should.be.a("object");
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("accessToken");
                    done();
                });
        });
    });
});
