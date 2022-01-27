const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

const { readFileSync } = require("fs");
let accessToken = readFileSync("./test/accessToken.txt", "utf-8");

const url = "/hcm/employee_master/employee";

describe("hcm employee master Test 1(employee)", () => {
    /**
     * Test the post
     */
    const randomName = Math.floor(Math.random() * 1000000);
    describe("/employee post test", () => {
        it("Should post a new employee", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id_number: `${randomName}`,
                    first_name: `${randomName}`,
                    middle_name: `${randomName}`,
                    employee_type_id: `1`,
                    gender: "1", //["male", "female"],
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("should return error 400, gender should be one of 1 or 2", (done) => {
            chai.request(server)
                .post(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id_number: `${randomName}`,
                    first_name: `${randomName}`,
                    employee_type_id: `1`,
                    middle_name: `${randomName}`,
                    gender: "3", //["male", "female"],
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("gender");
                    done();
                });
        });
    });
    /**
     * Test the get
     */
    let randomGottenId; //this is to make sure delete later works
    describe("Get Test", () => {
        it("should get employees", (done) => {
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

    describe("/employee delete", () => {
        it("Should delete a employee", (done) => {
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
        it("Should return error 400(no employee id sent)", (done) => {
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

    describe("/employee patch", () => {
        it("Should update a employee", (done) => {
            chai.request(server)
                .patch(url)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id: `${randomGottenId}`,
                    first_name: "yared",
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
                    first_name: "yared",
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
                    id: "1",
                    first_name: "yared",
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

const url2 = "/hcm/employee_master/experience";

describe("hcm employee master Test 2(experience)", () => {
    /**
     * Test the post
     */
    const randomName = Math.floor(Math.random() * 1000000);
    describe("/experience post test", () => {
        it("Should post a new experience", (done) => {
            chai.request(server)
                .post(url2)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    company: `${randomName}`,
                    job_title: `${randomName}`,
                    employee_id: 1,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("should return error 400, employee_id not sent", (done) => {
            chai.request(server)
                .post(url2)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    company: `${randomName}`,
                    job_title: `${randomName}`,
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("employee_id");
                    done();
                });
        });
    });
    /**
     * Test the get
     */
    let randomGottenId; //this is to make sure delete later works
    describe("Get Test", () => {
        it("should get titles", (done) => {
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

    describe("/experience delete", () => {
        it("Should delete a experience", (done) => {
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
        it("Should return error 400(no experience id sent)", (done) => {
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

    describe("/experience patch", () => {
        it("Should update a experience", (done) => {
            chai.request(server)
                .patch(url2)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id: randomGottenId,
                    updateData: {
                        job_title: "marketing management",
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
                        short_code: "yared terefe",
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
                        short_code: "yared terefe",
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
