import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // <User code>
  module Vehicle {
    public type Type = {
      #car;
      #bike;
      #truck;
      #bus;
      #other;
    };

    public type Document = {
      registration : ?Storage.ExternalBlob;
      insurance : ?Storage.ExternalBlob;
      pollution : ?Storage.ExternalBlob;
      service : ?Storage.ExternalBlob;
    };

    public type Expiry = {
      roadTax : Time.Time;
      insurance : Time.Time;
      pollution : Time.Time;
      service : Time.Time;
    };

    public type Vehicle = {
      owner : Principal;
      name : Text;
      registration : Text;
      model : Text;
      vehicleType : Type;
      documents : Document;
      expiryDates : Expiry;
    };

    public func compare(vehicle1 : Vehicle, vehicle2 : Vehicle) : Order.Order {
      switch (Text.compare(vehicle1.name, vehicle2.name)) {
        case (#equal) { Principal.compare(vehicle1.owner, vehicle2.owner) };
	      case (order) { order };
      };
    };
  };

  type Vehicle = Vehicle.Vehicle;
  type UserRole = AccessControl.UserRole;
  type Document = Vehicle.Document;
  type Expiry = Vehicle.Expiry;

  // Data structures
  let vehicles = Map.empty<Text, Vehicle>();

  public type VehicleInput = {
    name : Text;
    registration : Text;
    model : Text;
    vehicleType : Vehicle.Type;
    expiryDates : Expiry;
  };

  public type VehicleUpdate = {
    name : ?Text;
    registration : ?Text;
    model : ?Text;
    vehicleType : ?Vehicle.Type;
    expiryDates : ?Expiry;
  };

  // Helper functions
  func findVehicle(licensePlate : Text) : Vehicle {
    switch (vehicles.get(licensePlate)) {
      case (null) {
        Runtime.trap("Vehicle with license plate " # licensePlate # " does not exist.");
      };
      case (?vehicle) { vehicle };
    };
  };

  func vehicleIsOwner(vehicle : Vehicle, user : Principal) : Bool {
    vehicle.owner == user;
  };

  func filterByOwner(vehicles : [(Text, Vehicle)], owner : Principal) : [(Text, Vehicle)] {
    vehicles.filter(func((_, vehicle)) { vehicle.owner == owner });
  };

  func filterExpiringIn(vehicles : [(Text, Vehicle)], days : Int) : [(Text, Vehicle)] {
    let currentTime = Time.now();
    let milliSecondsInDay = 86_400_000_000_000;
    let range = days * milliSecondsInDay;
    vehicles.filter(
      func((_, vehicle)) {
        vehicle.expiryDates.roadTax - currentTime <= range or vehicle.expiryDates.insurance - currentTime <= range or vehicle.expiryDates.pollution - currentTime <= range or vehicle.expiryDates.service - currentTime <= range
      }
    );
  };

  func vehicleToDTO(vehicle : Vehicle, vehicleId : Text) : Vehicle {
    vehicle;
  };

  // <authorization>
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  // </authorization>

  // <blob-storage>
  include MixinStorage();
  // </blob-storage>

  // CRUD functions for vehicles
  public shared ({ caller }) func addVehicle(vehicleInput : VehicleInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add vehicles");
    };

    // Check if the license plate already exists
    if (vehicles.containsKey(vehicleInput.registration)) {
      Runtime.trap("Vehicle already exists.");
    };

    let newVehicle : Vehicle = {
      vehicleInput with
      owner = caller;
      documents = {
        registration = null;
        insurance = null;
        pollution = null;
        service = null;
      };
    };
    vehicles.add(vehicleInput.registration, newVehicle);
    vehicleInput.registration;
  };

  public query ({ caller }) func getVehicle(licensePlate : Text) : async Vehicle {
    let vehicle = findVehicle(licensePlate);
    if (caller == vehicle.owner or AccessControl.isAdmin(accessControlState, caller)) {
      vehicle;
    } else {
      Runtime.trap("Unauthorized: You must be the owner or admin to view this vehicle.");
    };
  };

  public query ({ caller }) func getAllVehiclesByOwner(owner : Principal) : async [Vehicle] {
    if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only owners or admin can fetch vehicles");
    };

    filterByOwner(vehicles.entries().toArray(), owner).map(
      func((_, vehicle)) { vehicle }
    );
  };

  public shared ({ caller }) func updateVehicle(licensePlate : Text, vehicleUpdate : VehicleUpdate) : async () {
    let existingVehicle = findVehicle(licensePlate);
    if (not vehicleIsOwner(existingVehicle, caller)) {
      Runtime.trap("Unauthorized: You must be the owner to update this vehicle.");
    };

    let updatedVehicle : Vehicle = {
      owner = existingVehicle.owner;
      name = switch (vehicleUpdate.name) { case (?n) { n }; case (null) { existingVehicle.name } };
      registration = switch (vehicleUpdate.registration) {
        case (?reg) { reg };
        case (null) { existingVehicle.registration };
      };
      model = switch (vehicleUpdate.model) { case (?m) { m }; case (null) { existingVehicle.model } };
      vehicleType = switch (vehicleUpdate.vehicleType) {
        case (?vt) { vt };
        case (null) { existingVehicle.vehicleType };
      };
      documents = existingVehicle.documents;
      expiryDates = switch (vehicleUpdate.expiryDates) {
        case (?ed) { ed };
        case (null) { existingVehicle.expiryDates };
      };
    };
    vehicles.add(licensePlate, updatedVehicle);
  };

  public shared ({ caller }) func deleteVehicle(licensePlate : Text) : async () {
    let vehicle = findVehicle(licensePlate);
    if (not vehicleIsOwner(vehicle, caller)) {
      Runtime.trap("Unauthorized: You must be the owner to delete this vehicle.");
    };

    vehicles.remove(licensePlate);
  };

  public shared ({ caller }) func updateVehicleDocuments(licensePlate : Text, newDocuments : Document) : async () {
    let vehicle = findVehicle(licensePlate);
    if (not vehicleIsOwner(vehicle, caller)) {
      Runtime.trap("Unauthorized: You must be the owner to update this vehicle.");
    };

    let updatedVehicle = {
      vehicle with documents = newDocuments;
    };

    vehicles.add(licensePlate, updatedVehicle);
  };

  public query ({ caller }) func getExpiringIn(days : Int) : async [Vehicle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch their vehicles");
    };

    let allVehicles = vehicles.entries().toArray();
    let expiringVehicles = filterExpiringIn(allVehicles, days);
    
    // Filter by ownership: users see only their own, admins see all
    let filteredVehicles = if (AccessControl.isAdmin(accessControlState, caller)) {
      expiringVehicles;
    } else {
      filterByOwner(expiringVehicles, caller);
    };

    filteredVehicles.map(
      func((_, vehicle)) { vehicle }
    );
  };

  public query ({ caller }) func getAllVehicles() : async [Vehicle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: You must be an admin to view all vehicles.");
    };
    vehicles.values().toArray();
  };
};
