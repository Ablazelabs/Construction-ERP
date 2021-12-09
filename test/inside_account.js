const chai = require("chai");
const server = require("../app");
const chaiHttp = require("chai-http");
chai.should();

chai.use(chaiHttp);

const { readFileSync, writeFileSync } = require("fs");
let accessToken = readFileSync("./test/accessToken.txt", "utf-8");

describe("Inside Account Test", () => {
    /**
     * Test the Login
     */

    describe("Login Test", () => {
        it("should return wrong password", (done) => {
            chai.request(server)
                .post("/account/login")
                .send({
                    email: `yaredterefeg@gmail.com`,
                    password: "passwordd",
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("password");
                    done();
                });
        });
        it("Should login user(send access token)", (done) => {
            chai.request(server)
                .post("/account/login")
                .send({
                    email: `yaredterefeg@gmail.com`,
                    password: "password",
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a("object");
                    response.body.should.have.property("accessToken");
                    writeFileSync(
                        "./test/accessToken.txt",
                        response.body.accessToken
                    );
                    done();
                });
        });
        // it("should return too many tries error", (done) => {
        //   chai
        //     .request(server)
        //     .post("/account/login")
        //     .send({ email: `yaredterefeg@gmail.com`, password: "passwordd" })
        //     .end((err, response) => {
        //       chai
        //         .request(server)
        //         .post("/account/login")
        //         .send({ email: `yaredterefeg@gmail.com`, password: "passwordd" })
        //         .end((err, response) => {
        //           chai
        //             .request(server)
        //             .post("/account/login")
        //             .send({
        //               email: `yaredterefeg@gmail.com`,
        //               password: "passwordd",
        //             })
        //             .end((err, response) => {
        //               chai
        //                 .request(server)
        //                 .post("/account/login")
        //                 .send({
        //                   email: `yaredterefeg@gmail.com`,
        //                   password: "passwordd",
        //                 })
        //                 .end((err, response) => {
        //                   chai
        //                     .request(server)
        //                     .post("/account/login")
        //                     .send({
        //                       email: `yaredterefeg@gmail.com`,
        //                       password: "passwordd",
        //                     })
        //                     .end((err, response) => {
        //                       chai
        //                         .request(server)
        //                         .post("/account/login")
        //                         .send({
        //                           email: `yaredterefeg@gmail.com`,
        //                           password: "passwordd",
        //                         })
        //                         .end((err, response) => {
        //                           response.should.have.status(423);
        //                           response.body.should.have.property("error");
        //                           response.body.error.should.have.property(
        //                             "access"
        //                           );
        //                           done();
        //                         });
        //                     });
        //                 });
        //             });
        //         });
        //     });
        // });
        it("should return error 400, user isnt registered", (done) => {
            chai.request(server)
                .post("/account")
                .send({
                    phone_number: `random phone number`,
                    password: "password",
                })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("phone_number");
                    done();
                });
        });
    });

    /**
     * Test the forgot password
     */

    describe("forgot password Test", () => {
        it("should return success", (done) => {
            chai.request(server)
                .post("/account/forgotpassword")
                .send({ email: `yaredterefeg@gmail.com` })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.have.property("success").eq(true);
                    done();
                });
        });
        it("should return error 400", (done) => {
            chai.request(server)
                .post("/account/forgotpassword")
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("identifier");
                    done();
                });
        });
    });

    /**
     * Test the send code
     */

    describe("send code Test", () => {
        it("should return success", (done) => {
            chai.request(server)
                .post("/account/sendcode")
                .send({ email: `yaredterefeg@gmail.com`, code: 123434 })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.have.property("tempAccessToken");
                    tempAccessToken = response.body.tempAccessToken;
                    done();
                });
        });
        it("should return error 400", (done) => {
            chai.request(server)
                .post("/account/sendcode")
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("code");
                    done();
                });
        });
        it("should return error 400", (done) => {
            chai.request(server)
                .post("/account/sendcode")
                .send({ email: "yaredterefeg@gmail.com", code: 4 })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("code");
                    done();
                });
        });
    });

    /**
     * Test the change password
     */

    describe("testing change password", () => {
        it("should return success, temp change", (done) => {
            chai.request(server)
                .post("/account/changepassword")
                .set({ Authorization: `Bearer ${tempAccessToken}` })
                .send({ newPassword: "password" })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.have.property("success").eq(true);
                    done();
                });
        });
        it("should return success, admin change", (done) => {
            chai.request(server)
                .post("/account/changepassword")
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    id: 1,
                    newPassword: "password",
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.have.property("success").eq(true);
                    done();
                });
        });
        it("should return success, self change", (done) => {
            chai.request(server)
                .post("/account/changepassword")
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    newPassword: "password",
                    password: "password",
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.have.property("success").eq(true);
                    done();
                });
        });
        it("should return error 400", (done) => {
            chai.request(server)
                .post("/account/changepassword")
                .set({ Authorization: `Bearer ${accessToken}` })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("newPassword");
                    done();
                });
        });
        it("should return error 400", (done) => {
            chai.request(server)
                .post("/account/changepassword")
                .set({ Authorization: `Bearer ${accessToken}` })
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.have.property("error");
                    response.body.error.should.have.property("newPassword");
                    done();
                });
        });
    });
});
