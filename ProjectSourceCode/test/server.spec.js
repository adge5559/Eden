//docker compose down -v before running tests in order to clear the users database

// ********************** Initialize server **********************************

const server = require('../index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************

describe('Testing register 1', () => {
  it('test route should redirect to /login', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'Jane Doe', password: 'Then, he used his fight money to buy two of every animal on earth'})
      .end((err, res) => {
        res.should.redirectTo(/^.*127\.0\.0\.1.*\/login$/); // Expecting a redirect to /login with the mentioned Regex
        done();
      });
  });
});

describe('Testing register 2', () => {
  it('test route should render /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'Jane Doe', password: 'Then, he used his fight money to buy two of every animal on earth'})
      .end((err, res) => {
        res.should.have.status(200); // Expecting a success status code
        res.should.be.html; // Expecting a HTML response
        done();
      });
  });
});

describe('Testing profile', () => {
  it('should not accept wrong credentials and display you are not logged in profile page', async() => {
    let agent = chai.request.agent(server);
    await agent.post('/login').send({username: 'Jane Doe', password: 'Wrong password'});

    const res = await agent.get("/profile")
    res.should.have.status(200);
    res.should.be.html;
    expect(res.text.indexOf("You are not logged in") !== -1).to.equal(true)
  });
});

describe('Testing profile', () => {
  it('should accept credentials and display correct profile page', async() => {
    let agent = chai.request.agent(server);
    await agent.post('/login').send({username: 'Jane Doe', password: 'Then, he used his fight money to buy two of every animal on earth'});

    const res = await agent.get("/profile")
    res.should.have.status(200);
    res.should.be.html;
    expect(res.text.indexOf("Jane Doe") !== -1).to.equal(true)
  });
});
