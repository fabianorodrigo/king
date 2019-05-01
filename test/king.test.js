const King = artifacts.require('King')
const TestBuxx = artifacts.require('TESTBUXX')
const { time } = require('openzeppelin-test-helpers');

contract('King', function([admin, anotherAccount, yetAnotherAccount, buxxAccount]) {
  let buxx;
  let king;
  const kingFee = 758;
  const commission = 230;
  
  beforeEach(async function() {
    buxx = await TestBuxx.new(0, "TestBuxx", 0, "BUX", {from: buxxAccount});
    await buxx.mint(anotherAccount, kingFee, {from: buxxAccount})
    await buxx.mint(yetAnotherAccount, kingFee, {from: buxxAccount})
    king = await King.new(buxx.address)
  });

  describe('King functions', function() {
    it('details', async function() {
      var _balance = await buxx.balanceOf(king.address);
      assert.equal(_balance, 0);
      var _king = await king.king();
      assert.equal(admin, _king) 
    })
    
    it('king', async function() {
      var _balance = await buxx.balanceOf(king.address);
      assert.equal(_balance, 0);
      await buxx.methods['transfer(address,uint256,bytes)'](king.address, kingFee, "0x", {from: anotherAccount} )
      var _king = await king.king();
      assert.equal(anotherAccount, _king) 
      _balance = await buxx.balanceOf(king.address);
      assert.equal(_balance, kingFee);
    })

    it('new king', async function() {
      await buxx.methods['transfer(address,uint256,bytes)'](king.address, kingFee, "0x", {from: anotherAccount} )
      await buxx.methods['transfer(address,uint256,bytes)'](king.address, kingFee, "0x", {from: yetAnotherAccount} )
      var _king = await king.king();
      assert.equal(yetAnotherAccount, _king) 
      var _prize = await king.prize();
      assert.equal(_prize, kingFee - commission + kingFee - commission)
    })

    it('new king with prize', async function() {
      await buxx.methods['transfer(address,uint256,bytes)'](king.address, kingFee, "0x", {from: anotherAccount} )
      await time.increase(time.duration.minutes(30))
      await buxx.methods['transfer(address,uint256,bytes)'](king.address, kingFee, "0x", {from: yetAnotherAccount} )
      var _king = await king.king();
      assert.equal(yetAnotherAccount, _king);
      var _balance = await buxx.balanceOf(anotherAccount);
      assert.equal(_balance, kingFee - commission)
      var _prize = await king.prize();
      assert.equal(_prize, kingFee - commission)
    })

    it('withdraw', async function() {
      await buxx.methods['transfer(address,uint256,bytes)'](king.address, kingFee, "0x", {from: anotherAccount} )
      await king.withdraw({from: admin});
      var _balance = await buxx.balanceOf(admin)
      assert.equal(_balance, commission);
    })
  });
});