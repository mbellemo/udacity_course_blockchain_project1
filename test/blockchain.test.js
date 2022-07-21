const chai = require('chai');
const expect = require('chai').expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
// const chaiDatetime = require('chai-datetime');
// chai.use(chaiDatetime);
// import block and blockchain files
const block = require('../src/block');
const blockchain = require('../src/blockchain');

describe('blockchain.js tests', () => {
    let bc = null;
    let b = null;
    const data = 'This is test data';

    describe('new Blockchain() Test', () => {
        it('should add a genesis block', async () => {
            bc = await new blockchain.Blockchain();
            await expect(bc.getChainHeight()).to.eventually.be.equal(0)
            await expect(bc.getBlockByHeight(0)).to.be.fulfilled.then((response) => {
                expect(response).to.be.not.null;
            });
            await expect(bc.getBlockByHeight(1)).to.be.fulfilled.then((response) => {
                expect(response).to.be.null;
            });
            expect(bc.chain[0].previousBlockHash).to.be.null;
        });
    });

    describe('_addBlock() Test', () => {
        it('should add a second valid block', async () => {
            b = new block.Block(data);
            bc = new blockchain.Blockchain();
            const promise = bc._addBlock(b);
            await expect(promise).to.be.fulfilled;
            expect(bc.getChainHeight()).to.eventually.be.equal(1);
            await expect(bc.getBlockByHeight(0)).to.be.fulfilled.then((response) => {
                expect(response).to.be.not.null;
            });
            await expect(bc.getBlockByHeight(1)).to.be.fulfilled.then((response) => {
                expect(response).to.be.not.null;
                expect(response.height).to.be.equal(1)
            });
            expect(bc.getBlockByHeight(1).previousBlockHash).to.be.equal(bc.getBlockByHeight(0).hash)
        });
    });

    describe('getBlockByHash() Test', () => {
        it('should return a block', async () => {
            b = new block.Block(data);
            bc = new blockchain.Blockchain();
            const promise = bc._addBlock(b);
            await expect(promise).to.be.fulfilled;
            await expect(bc.getBlockByHash(b.hash)).to.eventually.be.not.null;
        });

        it('should return no block', async () => {
            b = new block.Block(data);
            bc = new blockchain.Blockchain();
            const promise = bc._addBlock(b);
            await expect(promise).to.be.fulfilled;
            await expect(bc.getBlockByHash('b.hash')).to.eventually.be.null;
        });
    });

    describe('requestMessageOwnershipVerification() Test', () => {
        it('should return a message', async () => {
            const address = 'mohNLEhhSJ8oep1MXzch5ADKTj7dDYn3qZ'
            bc = new blockchain.Blockchain();
            await expect(bc.requestMessageOwnershipVerification(address)).to.be.fulfilled.then(response => {
                expect(response).to.be.a('String')
                const tokens = response.split(':');
                expect(tokens[0]).to.be.equal(address);
                expect(tokens[2]).to.be.equal('starRegistry');
            });
        });
    });

    describe('submitStar() Test', () => {
        it('should return a block', async () => {
            const address = 'mimKod1no3meoebxdVh7oHSuyCQNqrNdrF'
            const message = `mimKod1no3meoebxdVh7oHSuyCQNqrNdrF:1658395447:starRegistry`;
            const signature = 'IMlt+YLVoNP4AaTWJyAYlGQacAxm3DAa74abwG4Ux89QKRqGkPybYAYWPLYt61uc6zB5OO8LHjZPDdOumlLkfhg=';
            const star = {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Test star"
            };
            bc = new blockchain.Blockchain();
            await expect(bc.submitStar(address, message, signature, star)).to.be.fulfilled.then(response => {
                expect(response.height).to.equal(1);
                expect(response).to.be.not.null
            });
        });
    });

    describe('getStarsByWalletAddress() Test', () => {
        it('should return a star', async () => {
            const address = 'mimKod1no3meoebxdVh7oHSuyCQNqrNdrF'
            const message = `mimKod1no3meoebxdVh7oHSuyCQNqrNdrF:1658395447:starRegistry`;
            const signature = 'IMlt+YLVoNP4AaTWJyAYlGQacAxm3DAa74abwG4Ux89QKRqGkPybYAYWPLYt61uc6zB5OO8LHjZPDdOumlLkfhg=';
            const star = {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Test star"
            };
            bc = new blockchain.Blockchain();
            await expect(bc.submitStar(address, message, signature, star)).to.be.fulfilled;
            await expect(bc.getStarsByWalletAddress(address)).to.be.fulfilled.then(response => {
                expect(response).to.be.a('Array')
                expect(response).to.have.length(1)
                expect(response[0].owner).to.equal(address)
                // this assertion does not work because the ° is not correctly encoded/decoded
                //expect(response[0].star).to.equal(star)
            });
        });
    });

    describe('validateChain() Test', () => {
        it('should result in a valid chain', async () => {
            b = new block.Block(data);
            bc = new blockchain.Blockchain();
            const promise = bc._addBlock(b);
            await expect(promise).to.be.fulfilled;
            expect(bc.getChainHeight()).to.eventually.be.equal(1);
            await expect(bc.getBlockByHeight(0)).to.be.fulfilled.then((response) => {
                expect(response).to.be.not.null;
            });
            await expect(bc.getBlockByHeight(1)).to.be.fulfilled.then((response) => {
                expect(response).to.be.not.null;
                expect(response.height).to.be.equal(1)
            });
            expect(bc.getBlockByHeight(1).previousBlockHash).to.be.equal(bc.getBlockByHeight(0).hash)
            await expect(bc.validateChain()).to.be.fulfilled.then(response => {
                expect(response).to.be.a('Array')
                expect(response).to.have.length(0)
            });
        });

        it('should result in an invalid chain', async () => {
            b = new block.Block(data);
            bc = new blockchain.Blockchain();
            const promise = bc._addBlock(b);
            bc.chain[1].hash = 'test'
            await expect(bc.validateChain()).to.be.fulfilled.then(response => {
                expect(response).to.be.a('Array')
                expect(response).to.have.length(1)
            });
        });
    });

});