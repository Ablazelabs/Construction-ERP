const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

describe("role Test", () => {
  /**
   * Test the post
   */
  const randomName = Math.floor(Math.random() * 1000000);
  describe("/role post test", () => {
    it("Should post a new role", (done) => {
      chai
        .request(server)
        .post("/role")
        .send({
          name: `${randomName}`,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImlhdCI6MTYzODE3OTQzNSwiZXhwIjoxNjY5NzM3MDM1fQ.Q2wyNA9R1k9ETyR63cAZtYlxsIP-9ck9bm_AIhJppeo",
        })
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.property("success").equal(true);
          done();
        });
    });
    it("should return error 400, role already exists", (done) => {
      chai
        .request(server)
        .post("/role")
        .send({
          name: `${randomName}`,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImlhdCI6MTYzODE3OTQzNSwiZXhwIjoxNjY5NzM3MDM1fQ.Q2wyNA9R1k9ETyR63cAZtYlxsIP-9ck9bm_AIhJppeo",
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
    it("should get users", (done) => {
      chai
        .request(server)
        .get("/role")
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
      chai
        .request(server)
        .get("/role")
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

  describe("/role delete", () => {
    it("Should delete a role", (done) => {
      chai
        .request(server)
        .delete("/role")
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
    it("Should return error 400(no role id sent)", (done) => {
      chai
        .request(server)
        .delete("/role")
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

  describe("/role patch", () => {
    it("Should update a role", (done) => {
      chai
        .request(server)
        .patch("/role")
        .send({
          id: 2,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
          updateData: {
            name: "new",
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
      chai
        .request(server)
        .patch("/role")
        .send({
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
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
      chai
        .request(server)
        .patch("/account")
        .send({
          id: 1,
          updateData: {
            username: "yared terefe",
          },
          concurrency_stamp: "random",
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
