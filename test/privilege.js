const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

describe("privilege Test", () => {
  /**
   * Test the post
   */
  const randomAction = Math.floor(Math.random() * 1000000);
  describe("/privilege post test", () => {
    it("Should post a new privilege", (done) => {
      chai
        .request(server)
        .post("/privilege")
        .send({
          action: `${randomAction}`,
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
    it("should return error 400, privilege already exists", (done) => {
      chai
        .request(server)
        .post("/privilege")
        .send({
          action: `${randomAction}`,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImlhdCI6MTYzODE3OTQzNSwiZXhwIjoxNjY5NzM3MDM1fQ.Q2wyNA9R1k9ETyR63cAZtYlxsIP-9ck9bm_AIhJppeo",
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
      chai
        .request(server)
        .get("/privilege")
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
        .get("/privilege")
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

  describe("/privilege delete", () => {
    it("Should delete a privilege", (done) => {
      chai
        .request(server)
        .delete("/privilege")
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
    it("Should return error 400(no privilege id sent)", (done) => {
      chai
        .request(server)
        .delete("/privilege")
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

  describe("/privilege patch", () => {
    it("Should update a privilege", (done) => {
      chai
        .request(server)
        .patch("/privilege")
        .send({
          id: 2,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
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
      chai
        .request(server)
        .patch("/privilege")
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
