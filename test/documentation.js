const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

const { readFileSync } = require("fs");
let accessToken = readFileSync("./test/accessToken.txt", "utf-8");

const url = "/project/master/documentation";

describe("documentation Test", () => {
    /**
     * Test the post
     */
    const randomName = Math.floor(Math.random() * 1000000);
    describe("/documentation post test", () => {
        it("Should post a new documentation", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    name: `${randomName}`,
                    document_category_id: 1,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("should return error 400, documentation already exists", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    name: `${randomName}`,
                    document_category_id: 1,
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("name");
                    done();
                });
        });
    });
    /**
     * Test the get
     */
    let randomGottenId; //this is to make sure delete later works
    describe("Get Test", () => {
        it("should get documentations", (done) => {
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

    describe("/documentation delete", () => {
        it("Should delete a documentation", (done) => {
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
        it("Should return error 400(no documentation id sent)", (done) => {
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

    describe("/documentation patch", () => {
        it("Should update a documentation", (done) => {
            chai.request(server)
                .patch(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id: 1,
                    updateData: {
                        name: "new",
                    },
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
                        name: "yared terefe",
                    },
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
                .patch(url)
                .send({
                    id: 1,
                    updateData: {
                        username: "yared terefe",
                    },
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
