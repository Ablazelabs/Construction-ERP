const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

describe("operational data Test 1(project)", () => {
    /**
     * Test the post
     */
    const randomName = Math.floor(Math.random() * 1000000);
    describe("/project post test", () => {
        it("Should post a new project", (done) => {
            chai.request(server)
                .post("/project")
                .send({
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImlhdCI6MTYzODE3OTQzNSwiZXhwIjoxNjY5NzM3MDM1fQ.Q2wyNA9R1k9ETyR63cAZtYlxsIP-9ck9bm_AIhJppeo",
                    startDate: "2000/10/22",
                    endDate: "2000/10/23",
                    name: "string",
                    project_manager: "string",
                    project_start_date: "2020/12/21",
                    project_end_date: "2020/12/21",
                    project_id: `${randomName}`,
                    contract_number: "string",
                    site_engineer: "string",
                    dupty_manager: "string",
                    project_address: "string",
                    client_id: 1,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("should return error 400, project already exists", (done) => {
            chai.request(server)
                .post("/project")
                .send({
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImlhdCI6MTYzODE3OTQzNSwiZXhwIjoxNjY5NzM3MDM1fQ.Q2wyNA9R1k9ETyR63cAZtYlxsIP-9ck9bm_AIhJppeo",
                    startDate: "2000/10/22",
                    endDate: "2000/10/23",
                    name: "string",
                    project_manager: "string",
                    project_start_date: "2020/12/21",
                    project_end_date: "2020/12/21",
                    project_id: `${randomName}`,
                    contract_number: "string",
                    site_engineer: "string",
                    dupty_manager: "string",
                    project_address: "string",
                    client_id: 1,
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("project_id");
                    done();
                });
        });
    });
    /**
     * Test the get
     */
    let randomGottenId; //this is to make sure delete later works
    describe("Get Test", () => {
        it("should get projects", (done) => {
            chai.request(server)
                .get("/project")
                .send({
                    limit: 10,
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
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
                .get("/project")
                .send({
                    limit: 10,
                })
                .end((_err, response) => {
                    response.should.have.status(400);
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

    describe("/material delete", () => {
        it("Should delete a project", (done) => {
            chai.request(server)
                .delete("/project")
                .send({
                    id: randomGottenId,
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("Should return error 400(no project id sent)", (done) => {
            chai.request(server)
                .delete("/project")
                .send({
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
                })
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

    describe("/project patch", () => {
        it("Should update a project", (done) => {
            chai.request(server)
                .patch("/project")
                .send({
                    id: randomGottenId,
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
                    updateData: {
                        startDate: "2000/10/22",
                        endDate: "2000/10/23",
                        name: "string",
                        project_manager: "string",
                        project_start_date: "2020/12/21",
                        project_end_date: "2020/12/21",
                        contract_number: "string",
                        site_engineer: "string",
                        dupty_manager: "string",
                        project_address: "string",
                        client_id: 1,
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
                .patch("/project")
                .send({
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
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
                .patch("/project")
                .send({
                    id: 1,
                    updateData: {
                        username: "yared terefe",
                    },
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.be.a("object");
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("accessToken");
                    done();
                });
        });
    });
});

describe("operational data Test 2(daily work log)", () => {
    /**
     * Test the post
     */
    const randomName = Math.floor(Math.random() * 1000000);
    describe("/daily_work_log post test", () => {
        it("Should post a new daily_work_log", (done) => {
            chai.request(server)
                .post("/daily_work_log")
                .send({
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImlhdCI6MTYzODE3OTQzNSwiZXhwIjoxNjY5NzM3MDM1fQ.Q2wyNA9R1k9ETyR63cAZtYlxsIP-9ck9bm_AIhJppeo",
                    startDate: "2000/10/22",
                    endDate: "2000/10/23",
                    weather: "string",
                    day: "string",
                    temprature: "string",
                    time: "string",
                    name_of_employee: "string",
                    contact: "string",
                    cell_phone: "251-934175277",
                    contract_no: "string",
                    location: "string",
                    date: "2020/12/21",
                    project_id: 2,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
    });
    /**
     * Test the get
     */
    let randomGottenId; //this is to make sure delete later works
    describe("Get Test", () => {
        it("should get daily_work_logs", (done) => {
            chai.request(server)
                .get("/daily_work_log")
                .send({
                    limit: 10,
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
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
                .get("/daily_work_log")
                .send({
                    limit: 10,
                })
                .end((_err, response) => {
                    response.should.have.status(400);
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

    describe("/daily_work_log delete", () => {
        it("Should delete a daily_work_log", (done) => {
            chai.request(server)
                .delete("/daily_work_log")
                .send({
                    id: randomGottenId,
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("success").equal(true);
                    done();
                });
        });
        it("Should return error 400(no daily_work_log id sent)", (done) => {
            chai.request(server)
                .delete("/daily_work_log")
                .send({
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
                })
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

    describe("/daily_work_log patch", () => {
        it("Should update a daily_work_log", (done) => {
            chai.request(server)
                .patch("/daily_work_log")
                .send({
                    id: randomGottenId,
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
                    updateData: {
                        startDate: "2000/10/22",
                        endDate: "2000/10/23",
                        weather: "string",
                        day: "string",
                        temprature: "string",
                        time: "string",
                        name_of_employee: "string",
                        contact: "string",
                        cell_phone: "251-934175277",
                        contract_no: "string",
                        location: "string",
                        date: "2020/12/21",
                        project_id: 2,
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
                .patch("/daily_work_log")
                .send({
                    accessToken:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
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
                .patch("/daily_work_log")
                .send({
                    id: 1,
                    updateData: {
                        username: "yared terefe",
                    },
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.be.a("object");
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("accessToken");
                    done();
                });
        });
    });
});
