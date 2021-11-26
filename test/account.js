const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

describe("Account Test", () => {
  /**
   * Test the post
   */
  const randomEmailNum = Math.floor(Math.random() * 1000000);
  describe("/account post test", () => {
    it("Should post a new user", (done) => {
      chai
        .request(server)
        .post("/account")
        .send({
          email: `${randomEmailNum}@gmail.com`,
          password: "password",
        })
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.property("success").equal(true);
          done();
        });
    });
    it("should return error 400, user already exists", (done) => {
      chai
        .request(server)
        .post("/account")
        .send({ email: `yaredterefeg@gmail.com`, password: "password" })
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.have.property("error");
          response.body.error.should.have.property("email");
          done();
        });
    });
    it("should return error 400, user already exists", (done) => {
      chai
        .request(server)
        .post("/account")
        .send({ phone_number: `251-934175272`, password: "password" })
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.have.property("error");
          response.body.error.should.have.property("phone_number");
          done();
        });
    });
    it("should return error 400, phone number validation", (done) => {
      chai
        .request(server)
        .post("/account")
        .send({ phone_number: `251-93417527`, password: "password" })
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.have.property("error");
          response.body.error.should.have.property("phone_number");
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
        .get("/account")
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
        .get("/account")
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
    it("should return 1 user", (done) => {
      chai
        .request(server)
        .get("/account")
        .send({
          limit: 10,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
          filter: {
            email: "yaredterefeg@gmail.com",
          },
        })
        .end((_err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("array");
          response.body.should.have.lengthOf(1);
          response.body[0].should.be.a("object");
          response.body[0].should.have
            .property("email")
            .equal("yaredterefeg@gmail.com");
          done();
        });
    });
  });

  /**
   * Test the delete
   */

  describe("/account delete", () => {
    it("Should delete a user", (done) => {
      chai
        .request(server)
        .delete("/account")
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
    it("Should return error 400(no user id sent)", (done) => {
      chai
        .request(server)
        .delete("/account")
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

  describe("/account patch", () => {
    it("Should update a user", (done) => {
      chai
        .request(server)
        .patch("/account")
        .send({
          id: 1,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
          updateData: {
            username: "yared terefe",
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
        .patch("/account")
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
