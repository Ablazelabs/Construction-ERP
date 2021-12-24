const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

const { readFileSync } = require("fs");
let accessToken = readFileSync("./test/accessToken.txt", "utf-8");

const url = "/project/master/client";

describe("client Test", () => {
    /**
     * Test the post
     */
    const randomName = Math.floor(Math.random() * 1000000);
    describe("/client post test", () => {
        it("Should post a new client", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    name: `${randomName}`,
                    tradeName: `${randomName}`,
                    address: "address",
                    tel: `251-9${Math.floor(randomName / 100)}${Math.floor(
                        randomName / 100
                    )}`,
                    tinNumber: `${randomName}`,
                    contactPersonName: "string",
                    contactPersonPhone: `251-9${Math.floor(
                        randomName / 100
                    )}${Math.floor(randomName / 100)}`,
                    contactPersonEmail: `${randomName}@email.com`,
                    email: `${randomName}@email.com`,
                    startDate: "2000/10/22",
                    endDate: "2000/10/23",
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("should return error 400, client already exists", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    name: `${randomName}`,
                    tradeName: `${randomName}`,
                    address: "address",
                    tel: `251-9341752${Math.floor(randomName / 10000)}`,
                    tinNumber: `${randomName}`,
                    contactPersonName: "string",
                    contactPersonPhone: `251-9341752${Math.floor(
                        randomName / 10000
                    )}`,
                    contactPersonEmail: `${randomName}@email.com`,
                    email: `${randomName}@email.com`,
                    startDate: "2000/10/22",
                    endDate: "2000/10/23",
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    done();
                });
        });
        it("should return error 400, tel must be a phone no", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    name: `${randomName}2`,
                    tradeName: `${randomName}2`,
                    address: "address",
                    tel: `this is tel`,
                    tinNumber: `${randomName}2`,
                    contactPersonName: "string",
                    contactPersonPhone: `251-9341752${Math.floor(
                        randomName / 10000
                    )}2`,
                    contactPersonEmail: `${randomName}@email.com2`,
                    email: `${randomName}@email.com2`,
                    startDate: "2000/10/22",
                    endDate: "2000/10/23",
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("tel");
                    done();
                });
        });
    });
    /**
     * Test the get
     */
    let randomGottenId; //this is to make sure delete later works
    describe("/client Get Test", () => {
        it("should get clients", (done) => {
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
        it("should return 401, and no access token", (done) => {
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

    describe("/client delete", () => {
        it("Should delete a client", (done) => {
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
        it("Should return error 400(no client id sent)", (done) => {
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

    describe("/client patch", () => {
        it("Should update a client", (done) => {
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
