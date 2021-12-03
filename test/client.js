const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

describe("client Test", () => {
  /**
   * Test the post
   */
  const randomName = Math.floor(Math.random() * 1000000);
  describe("/client post test", () => {
    it("Should post a new client", (done) => {
      chai
        .request(server)
        .post("/client")
        .send({
          name: `${randomName}`,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImlhdCI6MTYzODE3OTQzNSwiZXhwIjoxNjY5NzM3MDM1fQ.Q2wyNA9R1k9ETyR63cAZtYlxsIP-9ck9bm_AIhJppeo",
          tradeName: `${randomName}`,
          address: "address",
          tel: `251-9341752${Math.floor(randomName / 10000)}`,
          tinNumber: `${randomName}`,
          contactPersonName: "string",
          contactPersonPhone: `251-9341752${Math.floor(randomName / 10000)}`,
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
      chai
        .request(server)
        .post("/client")
        .send({
          name: `${randomName}`,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImlhdCI6MTYzODE3OTQzNSwiZXhwIjoxNjY5NzM3MDM1fQ.Q2wyNA9R1k9ETyR63cAZtYlxsIP-9ck9bm_AIhJppeo",
          tradeName: `${randomName}`,
          address: "address",
          tel: `251-9341752${Math.floor(randomName / 10000)}`,
          tinNumber: `${randomName}`,
          contactPersonName: "string",
          contactPersonPhone: `251-9341752${Math.floor(randomName / 10000)}`,
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
  });
  /**
   * Test the get
   */
  let randomGottenId; //this is to make sure delete later works
  describe("Get Test", () => {
    it("should get clients", (done) => {
      chai
        .request(server)
        .get("/client")
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
        .get("/client")
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

  describe("/client delete", () => {
    it("Should delete a client", (done) => {
      chai
        .request(server)
        .delete("/client")
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
    it("Should return error 400(no client id sent)", (done) => {
      chai
        .request(server)
        .delete("/client")
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

  describe("/client patch", () => {
    it("Should update a client", (done) => {
      chai
        .request(server)
        .patch("/client")
        .send({
          id: 1,
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNjM3NzQxMjQ4LCJleHAiOjE2NjkyOTg4NDh9.y8G0PzSr4MYYelohErx9SHec9d3PVyQtZzVnA_Uq1g8",
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
      chai
        .request(server)
        .patch("/client")
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
      chai
        .request(server)
        .patch("/client")
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
