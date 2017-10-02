var Device;

Device = function() {
  this.available = PhoneGap.available;
  this.platform = null;
  this.version = null;
  this.name = null;
  this.uuid = null;
  return this.phonegap = null;
};
