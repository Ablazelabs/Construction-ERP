const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

const { readFileSync } = require("fs");
let accessToken = readFileSync("./test/accessToken.txt", "utf-8");

const url = "/hcm/time_and_leave/attendance_abscence_type";

describe("hcm time_and_leave Test 1(attendance_abscence_type)", () => {
    /**
     * Test the post
     */
    const randomName = Math.floor(Math.random() * 1000000);
    describe("/attendance_abscence_type post test", () => {
        it("Should post a new attendance_abscence_type", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    aa_description: `${randomName}`,
                    number_of_days: 10,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("should return error 400, aa_description already resgistered", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    aa_description: `${randomName}`,
                    number_of_days: 10,
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("aa_description");
                    done();
                });
        });
    });
    /**
     * Test the get
     */
    let randomGottenId; //this is to make sure delete later works
    describe("Get Test", () => {
        it("should get attendance_abscence_types", (done) => {
            chai.request(server)
                .get(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    limit: 10,
                    sort: {
                        id: 0,
                    },
                })
                .end((_err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("array");
                    randomGottenId = response.body[0].id;
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

    describe("/attendance_abscence_type delete", () => {
        it("Should delete a attendance_abscence_type", (done) => {
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
        it("Should return error 400(no attendance_abscence_type id sent)", (done) => {
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

    describe("/attendance_abscence_type patch", () => {
        it("Should update a attendance_abscence_type", (done) => {
            chai.request(server)
                .patch(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id: randomGottenId,
                    updateData: {
                        aa_description: `${randomName}_updated`,
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
                        aa_description: "yared",
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
                        aa_description: "yared",
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

const url2 = "/hcm/time_and_leave/holiday";

describe("hcm time_and_leave master Test 2(holiday)", () => {
    /**
     * Test the post
     */
    const randomName = Math.floor(Math.random() * 1000000);
    describe("/holiday post test", () => {
        it("Should post a new holiday", (done) => {
            chai.request(server)
                .post(url2)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    holiday_name: `${randomName}`,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("should return error 400, holiday name already registered", (done) => {
            chai.request(server)
                .post(url2)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    holiday_name: `${randomName}`,
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("holiday_name");
                    done();
                });
        });
    });
    /**
     * Test the get
     */
    let randomGottenId; //this is to make sure delete later works
    describe("Get Test", () => {
        it("should get employee taxes", (done) => {
            chai.request(server)
                .get(url2)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    limit: 10,
                    sort: {
                        id: 0,
                    },
                })
                .end((_err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("array");
                    randomGottenId = response.body[0].id;
                    done();
                });
        });
        it("should return 400, and no access token", (done) => {
            chai.request(server)
                .get(url2)
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

    describe("/holiday delete", () => {
        it("Should delete a holiday", (done) => {
            chai.request(server)
                .delete(url2)
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
        it("Should return error 400(no holiday id sent)", (done) => {
            chai.request(server)
                .delete(url2)
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

    describe("/holiday patch", () => {
        it("Should update a holiday", (done) => {
            chai.request(server)
                .patch(url2)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id: randomGottenId,
                    updateData: {
                        holiday_name: `${randomName}_updated`,
                    },
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("Should send 400 error message (no id)", (done) => {
            chai.request(server)
                .patch(url2)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    updateData: {
                        holiday_name: "yared terefe",
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
        it("Should send 400 error message (update data empty)", (done) => {
            chai.request(server)
                .patch(url2)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id: randomGottenId,
                    updateData: {
                        randomUselessKey: "some random string",
                    },
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.be.a("object");
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("updateData");
                    done();
                });
        });
        it("Should send 400 error message", (done) => {
            chai.request(server)
                .patch(url2)
                .send({
                    id: 1,
                    updateData: {
                        holiday_name: "yared terefe",
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
