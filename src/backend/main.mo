import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type Currency = { #usd; #inr };
  public type OrderStatus = { #pending; #processing; #completed; #cancelled };

  public type UserProfile = {
    name : Text;
  };

  public type BankAccount = {
    id : Nat;
    holderName : Text;
    bankName : Text;
    accountNumber : Text;
    routingOrIFSC : Text;
    currency : Currency;
    isDefault : Bool;
    user : Principal;
  };

  public type SellOrder = {
    id : Nat;
    user : Principal;
    usdtAmount : Float;
    payoutCurrency : Currency;
    exchangeRateUsed : Float;
    payoutAmount : Float;
    bankAccountSnapshot : BankAccount;
    status : OrderStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    adminNote : Text;
  };

  public type ExchangeRates = {
    usdRate : Float;
    inrRate : Float;
  };

  module SellOrder {
    public func compareById(order1 : SellOrder, order2 : SellOrder) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };

    public func compareByUserId(order1 : SellOrder, order2 : SellOrder) : Order.Order {
      Principal.compare(order1.user, order2.user);
    };
  };

  module BankAccount {
    public func compareById(account1 : BankAccount, account2 : BankAccount) : Order.Order {
      Nat.compare(account1.id, account2.id);
    };

    public func compareByUserId(account1 : BankAccount, account2 : BankAccount) : Order.Order {
      Principal.compare(account1.user, account2.user);
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let bankAccountsStore = Map.empty<Nat, BankAccount>();
  let sellOrdersStore = Map.empty<Nat, SellOrder>();
  var nextBankAccountId = 1;
  var nextOrderId = 1;
  var usdRate : Float = 1.0;
  var inrRate : Float = 75.0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Bank Accounts
  public shared ({ caller }) func addBankAccount(holderName : Text, bankName : Text, accountNumber : Text, routingOrIFSC : Text, currency : Currency, isDefault : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can add bank accounts");
    };

    let id = nextBankAccountId;
    let account : BankAccount = {
      id;
      holderName;
      bankName;
      accountNumber;
      routingOrIFSC;
      currency;
      isDefault;
      user = caller;
    };

    bankAccountsStore.add(id, account);
    nextBankAccountId += 1;
    id;
  };

  public shared ({ caller }) func updateBankAccount(id : Nat, holderName : Text, bankName : Text, accountNumber : Text, routingOrIFSC : Text, currency : Currency, isDefault : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update bank accounts");
    };

    switch (bankAccountsStore.get(id)) {
      case (null) { Runtime.trap("Bank account not found") };
      case (?existing) {
        if (existing.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot update this bank account");
        };

        let updated : BankAccount = {
          id;
          holderName;
          bankName;
          accountNumber;
          routingOrIFSC;
          currency;
          isDefault;
          user = existing.user;
        };

        bankAccountsStore.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteBankAccount(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can delete bank accounts");
    };

    switch (bankAccountsStore.get(id)) {
      case (null) { Runtime.trap("Bank account not found") };
      case (?account) {
        if (account.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete this bank account");
        };
        bankAccountsStore.remove(id);
      };
    };
  };

  public query ({ caller }) func getCallerBankAccounts() : async [BankAccount] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can get their bank accounts");
    };
    bankAccountsStore.values().toArray().filter(
      func(account) { account.user == caller }
    ).sort(BankAccount.compareById);
  };

  public query ({ caller }) func getUserBankAccounts(user : Principal) : async [BankAccount] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get other users' bank accounts");
    };
    bankAccountsStore.values().toArray().filter(
      func(account) { account.user == user }
    ).sort(BankAccount.compareById);
  };

  public query ({ caller }) func getBankAccount(id : Nat) : async ?BankAccount {
    switch (bankAccountsStore.get(id)) {
      case (null) { null };
      case (?account) {
        if (account.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot access this bank account");
        };
        ?account;
      };
    };
  };

  // Exchange Rates
  public shared ({ caller }) func setExchangeRate(currency : Currency, rate : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update exchange rates");
    };

    switch (currency) {
      case (#usd) { usdRate := rate };
      case (#inr) { inrRate := rate };
    };
  };

  public query func getExchangeRates() : async ExchangeRates {
    {
      usdRate;
      inrRate;
    };
  };

  // Sell Orders
  public shared ({ caller }) func createSellOrder(usdtAmount : Float, payoutCurrency : Currency, bankAccountId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create sell orders");
    };

    let exchangeRate = switch (payoutCurrency) {
      case (#usd) { usdRate };
      case (#inr) { inrRate };
    };

    let linkedAccount = switch (bankAccountsStore.get(bankAccountId)) {
      case (null) { Runtime.trap("Bank account not found") };
      case (?account) {
        if (account.user != caller) {
          Runtime.trap("Unauthorized: Cannot use this bank account");
        };
        account;
      };
    };

    let orderId = nextOrderId;
    let order : SellOrder = {
      id = orderId;
      user = caller;
      usdtAmount;
      payoutCurrency;
      exchangeRateUsed = exchangeRate;
      payoutAmount = usdtAmount * exchangeRate;
      bankAccountSnapshot = linkedAccount;
      status = #pending;
      createdAt = Time.now();
      updatedAt = Time.now();
      adminNote = "";
    };

    sellOrdersStore.add(orderId, order);
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getCallerOrders() : async [SellOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can get their orders");
    };
    sellOrdersStore.values().toArray().filter(
      func(order) { order.user == caller }
    ).sort(SellOrder.compareById);
  };

  public query ({ caller }) func getOrderById(id : Nat) : async ?SellOrder {
    switch (sellOrdersStore.get(id)) {
      case (null) { null };
      case (?order) {
        if (order.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot access this order");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func adminGetAllOrders() : async [SellOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get all orders");
    };
    sellOrdersStore.values().toArray().sort(SellOrder.compareById);
  };

  public shared ({ caller }) func adminUpdateOrderStatus(orderId : Nat, newStatus : OrderStatus, adminNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (sellOrdersStore.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?existing) {
        let updated : SellOrder = {
          id = existing.id;
          user = existing.user;
          usdtAmount = existing.usdtAmount;
          payoutCurrency = existing.payoutCurrency;
          exchangeRateUsed = existing.exchangeRateUsed;
          payoutAmount = existing.payoutAmount;
          bankAccountSnapshot = existing.bankAccountSnapshot;
          status = newStatus;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
          adminNote;
        };
        sellOrdersStore.add(orderId, updated);
      };
    };
  };
};
