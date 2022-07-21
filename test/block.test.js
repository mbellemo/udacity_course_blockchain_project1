const chai = require('chai');
const expect = require('chai').expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const SHA256 = require('crypto-js/sha256');
// import block file
const block = require('../src/block');

describe('block.js tests', () => {
    describe('new Block() Test:', () => {

        let b = null;
        const data = 'This is test data';
        const tamperedData = 'This is tampered data';

        before(function () {
            b = new block.Block(data);
            testBody = Buffer.from(JSON.stringify(data)).toString('hex');
            tamperedBody = Buffer.from(JSON.stringify(tamperedData)).toString('hex');
        });

        it('hash should be null', () => {
            expect(b.hash).to.be.null;
        });

        it('height should equal 0', () => {
            expect(b.height).to.equal(0);
        });

        it('time should equal 0', () => {
            expect(b.time).to.equal(0);
        });

        it('previous block hash should be null', () => {
            expect(b.previousBlockHash).to.be.null;
        });

        it('body should equal testBody', () => {
            expect(b.body).to.equal(testBody);
        });

        it('body should not equal tamperedBody', () => {
            expect(b.body).to.not.equal(tamperedBody);
        });
    });

    describe('validate() Test:', () => {
        let b = null;
        let auxiliaryHash = '';
        const data = 'This is test data';
        const tamperedData = 'this is tampered data';

        before(function () {
            b = new block.Block(data);
            auxiliaryHash = SHA256(JSON.stringify(b)).toString();
            b.hash = auxiliaryHash;
        });

        it('block should be valid', async () => {
            const result = await b.validate();
            expect(result).to.be.true;
            expect(b.hash).to.equal(auxiliaryHash);
        });

        it('block should be invalid', async () => {
            b.body = tamperedData;
            const result = await b.validate();
            expect(result).to.be.false;
            expect(b.hash).to.be.not.null;
            expect(b.hash).to.be.not.equal('');
        });
    });

    describe('getBData() Test:', () => {
        let b = null;
        const data = 'This is test data';

        before(function () {
            b = new block.Block(data);
        });

        it('genesis block should trigger an error', async () => {
            b.height = 0;
            const promise = b.getBData();
            await expect(promise).to.be.rejectedWith(Error);
        });

        it('non-genesis block should return the decoded body', async () => {
            b.height = 1;
            const body = await b.getBData();
            expect(body).to.be.equal(data);
        });
    });
});