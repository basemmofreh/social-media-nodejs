
const request = require('supertest');
const expect = require('expect');
var app = require('../index').app;
const toke = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjcyMzIxZDE2YzAyYTI5NjQzNGEyNzUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTM0MjEwOTUyfQ.yufLG4PUwq6Tb-nPiFiM60c9cPdS_v5KvQbC0uGsXNc';
describe("Server up and running ",()=>{
    it("should get the name basem",(done)=>{
      request(app)
      .get('/')
      .set('x-auth',toke)
      .expect(401)
      .end(done)
    })


});

describe("get all msgs",function(){
  it('should return all msgs',function(done){
    this.timeout(0);
            request(app)
            .get('/api/all')
            .set('x-auth',toke)
            .expect(200)
            .end(done);

  })



  it('should login in ',function(done){
    this.timeout(0);
    request(app)
    .post('/api/auth/signin')
    .send({email:"koko1@gmail.com",user:"koko1",password:"koko1"})
    .expect(200)
    .end(done)
  })
})
