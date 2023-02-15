const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender;
    let realEstate, escrow, result;
    
    beforeEach(async () => {
            // Setup accounts
            [buyer, seller, inspector, lender] = await ethers.getSigners();
            // Deploy Real Estate
            const RealEstate = await ethers.getContractFactory('RealEstate');
            realEstate = await RealEstate.deploy();

            // Mint
            let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            await transaction.wait();
    
            const Escrow = await ethers.getContractFactory('Escrow');
            escrow = await Escrow.deploy(
                realEstate.address,
                seller.address,
                inspector.address,
                lender.address
            );

            //Approve property 
            transaction = await realEstate.connect(seller).approve(escrow.address, 1);
            await transaction.wait();

            // List property
            transaction = await escrow.connect(seller).list(1);
            await transaction.wait();
    })

    describe('Deployment', () => {
        
        it('Returns NFT address', async () => {
            result = await escrow.nftAddress();
            expect(result).to.be.equal(realEstate.address);
        })
        
        it('Returns seller', async () => {
            result = await escrow.seller();
            expect(result).to.be.equal(seller.address);
        })

        it('Returns inspector', async () => {
            result = await escrow.inspector();
            expect(result).to.be.equal(inspector.address);
        })

        it('Returns lender', async () => {
            result = await escrow.lender();
            expect(result).to.be.equal(lender.address);
        })
    });
})
